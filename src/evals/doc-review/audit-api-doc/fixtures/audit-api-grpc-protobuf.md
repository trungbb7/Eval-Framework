# Order Streaming Service (gRPC)

Real-time order tracking service via gRPC stream.

## Service Definition

```protobuf
service OrderService {
  rpc StreamOrderStatus (OrderRequest) returns (stream OrderStatusResponse);
}

message OrderRequest {
  string order_id = 1;
}

message OrderStatusResponse {
  string status = 1;
}
```

This service allows client connection to stream order status.
