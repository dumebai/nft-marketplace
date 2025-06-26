curl --request POST \
  --url https://api.circle.com/v1/w3s/compliance/screening/addresses \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer TEST_API_KEY:2902fd958f289a7b452bd1db532179d2:468eed24e845ab21eced5f1f4a9d1a34' \
  --data '
{
  "idempotencyKey": "0af02923-a3e3-41b8-9cd1-09cb4d3cce75",
  "address": "0xA13fD5d38443dcdb3ADCAD337594D180C1479Fc2",
  "chain": "ETH-SEPOLIA"
}
'