import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import NFTBox from "./NFTBox"
import Link from "next/link"

interface NFTItem {
    rindexerId: string
    seller: string
    nftAddress: string
    price: string
    tokenId: string
    contractAddress: string
    txHash: string
    blockNumber: number
}

interface BoughtCancelled {
    nftAddress: string
    tokenId: string
}

interface NFTQueryResponse {
    data: {
        allItemListeds: {
            nodes: NFTItem[]
        },
        allItemBoughts: {
            nodes: BoughtCancelled[]
        },
        allItemCanceleds: {
            nodes: BoughtCancelled[]
        },
    }
}



// GraphQL query to get all ItemListed events
const GET_RECENT_NFTS = `
query AllItemListeds{
  allItemListeds(first: 20, orderBy: [BLOCK_NUMBER_DESC, TX_INDEX_DESC]) {
    nodes {
      seller
      nftAddress
      price
      tokenId
      contractAddress
      txHash
      blockNumber
    }
  }
  allItemCanceleds {
  nodes{
    nftAddress
    tokenId}
  }
  allItemBoughts {
  nodes{
    tokenId
    nftAddress}
  }
}
`

async function fetchNFTs(): Promise<NFTQueryResponse> {
    const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: GET_RECENT_NFTS,
        }),
    })
    return response.json()
}

console.log(await fetchNFTs())

function useRecentlyListedNFTs() {
    const { data, isLoading, error } = useQuery<NFTQueryResponse>({
        queryKey: ["recentNFTs"],
        queryFn: fetchNFTs,
    })  
    const nftDataList = useMemo(() => {
        if (!data) return []

        const boughtNFTs = new Set<String>()
        const canceledNFTs = new Set<String>()

        data.data.allItemBoughts.nodes.forEach((item) => {
            boughtNFTs.add(`${item.nftAddress}-${item.tokenId}`)
        })

        data.data.allItemCanceleds.nodes.forEach((item) => {
            canceledNFTs.add(`${item.nftAddress}-${item.tokenId}`)
        })

        const availNFTs = data.data.allItemListeds.nodes.filter((item) => {
            if (!item.nftAddress || !item.tokenId) return false
            const nftKey = `${item.nftAddress}-${item.tokenId}`
            return !boughtNFTs.has(nftKey) && !canceledNFTs.has(nftKey)
        })

        const recent = availNFTs.slice(0, 100)
        return recent.map((item ) => ({
            price: item.price,
            tokenId: item.tokenId,
            nftAddress: item.nftAddress,
        }))
    }, [data])

    return {
        nftDataList,
        isLoading,
        error,
    }
}

export default function RecentlyListedNFTs() {
    const { nftDataList, isLoading, error } = useRecentlyListedNFTs()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mt-8 text-center">
        <Link
          href="/list-nft"
          className="inline-block py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          List Your NFT
        </Link>
        </div>
        <h2 className="text-2xl font-bold mb-6">Recently Listed NFTs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
            <div className="col-span-full text-center">Loading...</div>
        ) : error ? (
            <div className="col-span-full text-red-500">Error loading NFTs</div>
        ) : nftDataList.length === 0 ? (
            <div className="col-span-full text-gray-500">No NFTs found</div>
        ) : (
            nftDataList.map((nft, index) => (
                <Link href={`/buy-nft/${nft.nftAddress}/${nft.tokenId}`} className="hover:underline">
            <NFTBox
                key={index}
                tokenId={nft.tokenId}
                contractAddress={nft.nftAddress}
                price={nft.price}
            />
            </Link>
            ))
        )}
      </div>
    </div>
  )
}