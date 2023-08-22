export const postProfile = async (nric: string, address: `0x${string}`) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nric,
        wallet_address: address,
      })
    })

    if (res.ok && res.status == 200) {
      return await res.json()
    }
  } catch (err) {
    console.log(err)
    return {}
  }
}
