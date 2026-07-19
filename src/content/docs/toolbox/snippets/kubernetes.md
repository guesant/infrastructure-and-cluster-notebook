---
title: Kubernetes snippets
sidebar:
  order: 3
---

## Deployment básico

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:1.0
        ports:
        - containerPort: 8000
```yaml

3 replicas de myapp com seletor por label.

---

## Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-svc
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```yaml

Expõe deployment (NodePort, LoadBalancer, ou ClusterIP internal).

---

## ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  app.conf: |
    server {
      listen 8000;
    }
  debug: "true"
---
apiVersion: v1
kind: Deployment
spec:
  ...
  volumes:
  - name: config
    configMap:
      name: app-config
  containers:
  - volumeMounts:
    - name: config
      mountPath: /etc/app
```yaml

ConfigMap montado como volume.

---

## Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=      # base64 encoded
  password: cGFzc3dvcmQ=
---
containers:
- name: app
  env:
  - name: DB_USER
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: username
```yaml

Secret com credenciais, referenciado por container.

---

## Resource requests/limits

```yaml
containers:
- name: app
  resources:
    requests:
      cpu: "100m"
      memory: "128Mi"
    limits:
      cpu: "500m"
      memory: "512Mi"
```yaml

Requests = garantido, Limits = máximo (OOM se exceder).

---

## Healthcheck

```yaml
containers:
- name: app
  livenessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 30
    periodSeconds: 10
  readinessProbe:
    httpGet:
      path: /ready
      port: 8000
    initialDelaySeconds: 5
```yaml

Liveness (reinicia se falha), Readiness (remove do LB se falha).

---

## Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-svc
            port:
              number: 80
```yaml

Expõe service via HTTP(S) por hostname.

---

## PersistentVolumeClaim

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  storageClassName: longhorn
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
containers:
- volumeMounts:
  - name: data
    mountPath: /data
volumes:
- name: data
  persistentVolumeClaim:
    claimName: data-pvc
```yaml

Volume persistente montado no container.

---

## Labels e selectors

```yaml
metadata:
  labels:
    app: myapp
    version: v1
    env: prod
selector:
  matchLabels:
    app: myapp
    env: prod
  matchExpressions:
  - key: version
    operator: In
    values: ["v1", "v2"]
```yaml

Labels para organizar e selecionar resources.
