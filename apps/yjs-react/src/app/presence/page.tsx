import { CONNECTION_STRING } from '@/lib/config'
import { Presence } from './Presence'
import { YDocProvider } from '@y-sweet/react'
import { getOrCreateDoc } from '@y-sweet/sdk'

type HomeProps = {
  searchParams: Record<string, string>
}

export default async function Home({ searchParams }: HomeProps) {
  const clientToken = await getOrCreateDoc(searchParams.doc, CONNECTION_STRING)

  return (
    <YDocProvider clientToken={clientToken} setQueryParam="doc">
      <Presence />
    </YDocProvider>
  )
}