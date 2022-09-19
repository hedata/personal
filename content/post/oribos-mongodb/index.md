---
title: Development Environment - mongodb with k3d and tilt
subtitle:  Time to take some time and improve my development experience. 
date: 2021-11-30T00:09:04.225Z
summary: Setting up mongodb with tilt on k3d
draft: false
featured: false
authors:
  - admin
lastmod: 2021-11-30T00:00:00Z
tags:
  - tilt
  - k3d
categories:
  - Fun
  - Coding
projects: []
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false
---

## Development Environment - tilt mongodb

since k3d cluster is running inside docker if we want persistent volumes where we have access to them on our local machine we have to take extra care.

A quick deployment file for the cluster. 

```yaml
aapiVersion: apps/v1
kind: Deployment
metadata:  
  labels:
    app: mongodb
  name: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: mongodb
    app: mongodb
    spec:
      containers:
        - image: mongo:3.4.3
          name: mongo
          resources: {
          }
          ports:
            - name: http
              containerPort: 27017
              protocol: TCP
          env:
            - name: MONGO_INITDB_ROOT_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: mongo-root-username
            - name: MONGO_INITDB_ROOT_PASSWORD
              valueFrom:
                 secretKeyRef:
                  name: mongodb-secret
                  key: mongo-root-password
          volumeMounts:
            - mountPath: /data/db
              name: mongo-claim
      restartPolicy: Always
      volumes:
        - name: mongo-claim
          persistentVolumeClaim:
            claimName: mongodbvclaim
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
spec:
  type: ClusterIP
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017    
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  labels:
    app: mongodb
  name: mongodbvclaim
spec:
  volumeName: mongodb-volume
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
status: {}
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongodb-volume
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/data/mongo" #here we can use our interval volume

```
and a secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-secret
type: Opaque
data:
  mongo-root-username: yourusername
  mongo-root-password: yourpassword  
```
add to cluster via tiltfile
```yaml
# version_settings() enforces a minimum Tilt version
# https://docs.tilt.dev/api.html#api.version_settings
version_settings(constraint='>=0.22.2')
#Database
#
#MONGODB
k8s_yaml('secrets/mongodb-secret.yaml');
k8s_yaml('database/mongo/deployment.yaml');
```

start everything with tilt up

you can check the volumes with:
```bash
kubectl get pv
kubectl get pvc
```

watch everything with
```bash
kubectl get all --all-namespaces
```
