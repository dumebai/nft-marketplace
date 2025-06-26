import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const { address } = await req.json();

  if (!address) {
    return Response.json({ error: 'Missing address' }, { status: 400 });
  }

  const complianceEnabled = process.env.ENABLE_COMPLIANCE_CHECK === 'true';
  if (!complianceEnabled) {
    return Response.json({ 
        success: true,
        isApproved: true,
        data: {
            result: "APPROVED",
            message: "Compliance check is disabled",
        }
    });
  }

  const body = {
    idempotencyKey: uuidv4(),
    address,
    chain: 'ETH-SEPOLIA', // Hardcoded
  };

  try {
    const res = await fetch('https://api.circle.com/v1/w3s/compliance/screening/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CIRCLE_API_KEY}`, // secure storage in .env
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const isApproved = data?.data?.result === 'APPROVED';
    return Response.json({
      success: true,
      isApproved,
      data: data?.data
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch from Circle API' }, { status: 500 });
  }
}
