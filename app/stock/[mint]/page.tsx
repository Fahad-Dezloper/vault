import { DetailClient } from '@/components/DetailClient'

interface Props {
  params: Promise<{ mint: string }>
}

export default async function StockPage({ params }: Props) {
  const { mint } = await params
  return (
    <main className="min-h-svh">
      <DetailClient mint={mint} />
    </main>
  )
}
