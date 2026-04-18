# Test Cases — MOTADATA-8021_TestCases.xlsx

**Total test cases:** 35

**Source sheet:** Sheet1

---

## 1. Verify instrumentation on Kubernetes (EKS)

- **Step Action:** Deploy application on EKS and enable OTel instrumentation
- **Step Expected Result:** Traces are generated and visible in APM

## 2. Verify instrumentation on Kubernetes (AKS)

- **Step Action:** Deploy application on AKS with instrumentation enabled
- **Step Expected Result:** Traces are collected successfully

## 3. Verify instrumentation on Kubernetes (GKE)

- **Step Action:** Deploy application on GKE and configure collector
- **Step Expected Result:** Traces are received in APM

## 4. Verify instrumentation on OpenShift

- **Step Action:** Deploy application on OpenShift cluster
- **Step Expected Result:** Instrumentation works without SCC/security issues

## 5. Verify instrumentation using operator-based approach

- **Step Action:** Deploy OTel operator + webhook
- **Step Expected Result:** Auto-instrumentation injected successfully

## 6. Verify instrumentation using init container

- **Step Action:** Deploy app with init container setup
- **Step Expected Result:** Application is instrumented without code changes

## 7. Verify container-based instrumentation (non-K8s)

- **Step Action:** Run application in ECS/ACI with env-based config
- **Step Expected Result:** Traces are generated and sent to collector

## 8. Verify serverless instrumentation (AWS Lambda)

- **Step Action:** Deploy Lambda function with instrumentation wrapper
- **Step Expected Result:** Traces are generated and visible

## 9. Verify serverless instrumentation (Azure Functions)

- **Step Action:** Deploy Azure function with instrumentation
- **Step Expected Result:** Trace data captured successfully

## 10. Verify PaaS instrumentation (App Service)

- **Step Action:** Deploy app in Azure App Service
- **Step Expected Result:** Instrumentation works via startup hook/buildpack

## 11. Verify VM-based instrumentation

- **Step Action:** Install host-based agent on VM
- **Step Expected Result:** Application traces are captured

## 12. Verify multi-language support (Java)

- **Step Action:** Instrument Java application
- **Step Expected Result:** Traces captured correctly

## 13. Verify multi-language support (.NET)

- **Step Action:** Instrument .NET application
- **Step Expected Result:** Traces captured correctly

## 14. Verify multi-language support (Python)

- **Step Action:** Instrument Python application
- **Step Expected Result:** Traces captured correctly

## 15. Verify multi-language support (Node.js)

- **Step Action:** Instrument Node.js application
- **Step Expected Result:** Traces captured correctly

## 16. Verify multi-language support (Go)

- **Step Action:** Instrument Go application
- **Step Expected Result:** Traces captured

## 17. Verify distributed trace propagation

- **Step Action:** Trigger request across multiple services
- **Step Expected Result:** Single trace ID propagated across services

## 18. Verify W3C trace context support

- **Step Action:** Inspect headers (traceparent)
- **Step Expected Result:** Trace context is correctly propagated

## 19. Verify async trace continuity

- **Step Action:** Trigger async messaging flow
- **Step Expected Result:** Trace continuity maintained across async calls

## 20. Verify autoscaling support

- **Step Action:** Enable HPA/KEDA scaling
- **Step Expected Result:** New pods auto-instrumented without manual config

## 21. Verify ephemeral workload support

- **Step Action:** Deploy short-lived containers
- **Step Expected Result:** Traces captured for short-lived workloads

## 22. Verify cold start behavior in serverless

- **Step Action:** Invoke function after idle time
- **Step Expected Result:** Traces captured without significant delay

## 23. Verify minimal configuration requirement

- **Step Action:** Setup instrumentation using default config
- **Step Expected Result:** Works with minimal setup steps

## 24. Verify backward compatibility

- **Step Action:** Run existing instrumented app
- **Step Expected Result:** Existing instrumentation continues to work

## 25. Verify single port ingestion (4318)

- **Step Action:** Send traces to collector on port 4318
- **Step Expected Result:** Traces successfully received

## 26. Verify cluster API endpoint integration

- **Step Action:** Call /kubernetes/cluster endpoint
- **Step Expected Result:** Application metadata received correctly

## 27. Verify network connectivity to collector

- **Step Action:** Send trace via curl to collector endpoint
- **Step Expected Result:** Collector responds successfully

## 28. Verify failure when network blocked

- **Step Action:** Block outbound traffic from cluster
- **Step Expected Result:** Traces are not received and error is logged

## 29. Verify instrumentation with hybrid setup

- **Step Action:** Deploy app across VM + container
- **Step Expected Result:** Trace continuity maintained

## 30. Verify security/RBAC compliance

- **Step Action:** Apply restricted policies (OpenShift SCC/IAM)
- **Step Expected Result:** Instrumentation works within constraints

## 31. Verify performance overhead

- **Step Action:** Monitor app performance after instrumentation
- **Step Expected Result:** No significant latency or resource overhead

## 32. Verify sampling configuration

- **Step Action:** Apply sampling rules
- **Step Expected Result:** Traces are sampled as per configuration

## 33. Verify documentation usability

- **Step Action:** Follow provided setup docs
- **Step Expected Result:** User can instrument app successfully

## 34. Verify service naming consistency

- **Step Action:** Deploy multiple services
- **Step Expected Result:** Services appear correctly named in APM

## 35. Verify error handling in instrumentation

- **Step Action:** Introduce failure in config/setup
- **Step Expected Result:** Proper error/logs shown without crash
