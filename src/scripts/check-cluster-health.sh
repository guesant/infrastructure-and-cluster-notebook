#!/bin/bash
# Automated cluster health check (smoke test)
# Usage: ./check-cluster-health.sh
# Output: JSON report of cluster status

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Results array
declare -A results

# Helper functions
check_command() {
  local cmd="$1"
  if command -v "$cmd" &>/dev/null; then
    results["cmd_$cmd"]="pass"
    echo -e "${GREEN}✓${NC} Command available: $cmd"
  else
    results["cmd_$cmd"]="fail"
    echo -e "${RED}✗${NC} Command missing: $cmd"
  fi
}

check_cluster_accessible() {
  if kubectl cluster-info &>/dev/null; then
    results["cluster_accessible"]="pass"
    echo -e "${GREEN}✓${NC} Cluster accessible"
  else
    results["cluster_accessible"]="fail"
    echo -e "${RED}✗${NC} Cluster not accessible"
  fi
}

check_nodes_ready() {
  local ready_nodes
  ready_nodes=$(kubectl get nodes -o jsonpath='{.items[?(@.status.conditions[?(@.type=="Ready")].status=="True")].metadata.name}' 2>/dev/null | wc -w)
  local total_nodes
  total_nodes=$(kubectl get nodes -o jsonpath='{.items[*].metadata.name}' 2>/dev/null | wc -w)

  if [[ $ready_nodes -eq $total_nodes ]] && [[ $total_nodes -gt 0 ]]; then
    results["nodes_ready"]="pass"
    echo -e "${GREEN}✓${NC} All nodes ready ($ready_nodes/$total_nodes)"
  else
    results["nodes_ready"]="fail"
    echo -e "${RED}✗${NC} Nodes not ready ($ready_nodes/$total_nodes)"
  fi
}

check_pods_running() {
  local failed_pods
  failed_pods=$(kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded -o jsonpath='{.items[*].metadata.name}' 2>/dev/null | wc -w)

  if [[ $failed_pods -eq 0 ]]; then
    results["pods_running"]="pass"
    echo -e "${GREEN}✓${NC} No failed pods"
  else
    results["pods_running"]="fail"
    echo -e "${YELLOW}⚠${NC} Failed pods: $failed_pods"
  fi
}

check_api_responsive() {
  if kubectl api-resources &>/dev/null; then
    results["api_responsive"]="pass"
    echo -e "${GREEN}✓${NC} API responsive"
  else
    results["api_responsive"]="fail"
    echo -e "${RED}✗${NC} API not responsive"
  fi
}

generate_json_report() {
  local pass_count=0
  local fail_count=0

  for key in "${!results[@]}"; do
    if [[ "${results[$key]}" == "pass" ]]; then
      ((pass_count++))
    else
      ((fail_count++))
    fi
  done

  cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "total": $((pass_count + fail_count)),
    "passed": $pass_count,
    "failed": $fail_count
  },
  "checks": {
EOF

  local first=true
  for key in "${!results[@]}"; do
    if [[ "$first" == true ]]; then
      first=false
    else
      echo ","
    fi
    echo -n "    \"$key\": \"${results[$key]}\""
  done

  echo ""
  echo "  }"
  echo "}"
}

# Main execution
echo "=== Cluster Health Check ==="
echo ""

check_command kubectl
check_command helm
check_command jq
echo ""

check_cluster_accessible
check_nodes_ready
check_pods_running
check_api_responsive
echo ""

echo "=== JSON Report ==="
generate_json_report
