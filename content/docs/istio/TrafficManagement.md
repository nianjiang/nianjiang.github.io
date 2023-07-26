---
weight: 51
title: "Traffic Management"
---


# Traffic Management

### Goal

- Understand how to expose services from the cluster.

- Understand how Istio knows where to route the traffic and how the traffic gets routed.

- Understand how to split traffic based on weight and other request properties.

- Understand how service resilience, failure injection, and circuit breaking features work.

- Understand how to bring external services to the mesh using the ServiceEntry resource.

### Other

- Open Tunnel: ***minikube tunnel***

```
abc@local: ~> minikube tunnel
✅  Tunnel successfully started

📌  NOTE: Please do not close this terminal as this process must stay alive for the tunnel to be accessible ...

❗  The service/ingress istio-ingressgateway requires privileged ports to be exposed: [80 443]
🔑  sudo permission will be asked for it.
🏃  Starting tunnel for service istio-ingressgateway.
Password:
```

## Reference

[Istio Docs](https://istio.io/latest/docs/) 

[《Introduction to Istio》](https://learning.edx.org/course/course-v1:LinuxFoundationX+LFS144x+3T2022/home),
[《Introduction to Istio》-Github](https://github.com/tetratelabs/cncf-istio-course?utm_source=cncf-course&utm_medium=course&utm_campaign=course)

[Prometheus](https://prometheus.io/)
