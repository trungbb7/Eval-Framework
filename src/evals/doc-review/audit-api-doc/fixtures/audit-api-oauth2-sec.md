# Payment Processing API

Integration guide for credit card payments gateway.

## Payment Charge Endpoint

`POST /api/v2/payments/charge`

Creates a credit card charge transaction.

### Request Body
```json
{
  "amount": 5000,
  "currency": "USD",
  "cardNumber": "4532xxxx"
}
```

### Response Success
```json
{
  "transactionId": "TXN_99821",
  "status": "SUCCESS"
}
```

*Note: The API requires a valid token to call.*
