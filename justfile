set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

docs_image := "cluster-management-notes-docs:local"
docs_dockerfile := ".github/docker/mkdocs/Dockerfile"
docs_context := ".github/docker/mkdocs"

default:
    @just --list

# Constrói a documentação e valida todos os avisos do MkDocs
docs-build: _docs-image
    docker run --rm \
        --user "$(id -u):$(id -g)" \
        --env HOME=/tmp \
        --volume "${PWD}:/docs" \
        {{docs_image}} \
        build --strict

# Serve a documentação em http://localhost:8000
docs-serve: _docs-image
    docker run --rm \
        --user "$(id -u):$(id -g)" \
        --env HOME=/tmp \
        --publish 8000:8000 \
        --volume "${PWD}:/docs" \
        {{docs_image}}

_docs-image:
    docker build \
        --file {{docs_dockerfile}} \
        --tag {{docs_image}} \
        {{docs_context}}
