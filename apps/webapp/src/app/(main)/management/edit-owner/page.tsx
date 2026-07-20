'use client'

import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import EditOwnerForm from './_components/edit-owner-form'

export default function EditOwnerPage() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState('')

  const { data: accounts, isLoading } = api.waterAccount.getWaterAccountsByCommunityId.useQuery(
    { communityId: communityId || '' },
    { enabled: !!communityId }
  )

  const filteredAccounts = useMemo(() => {
    if (!accounts) return []

    return accounts
      .filter((account) => {
        if (!nameFilter || nameFilter.length < 2) return true
        const searchLower = nameFilter.toLowerCase()
        return (
          account.name.toLowerCase().includes(searchLower) ||
          account.nationalId.toLowerCase().includes(searchLower) ||
          (account.phone?.toLowerCase().includes(searchLower) ?? false)
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [accounts, nameFilter])

  if (!communityId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No hay comunidad asignada</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Editar Titular</h1>
          <p className="text-muted-foreground">
            Selecciona el titular cuyos datos deseas actualizar
          </p>
        </div>

        <div className="w-full max-w-md">
          <SearchInput
            value={nameFilter}
            onChange={setNameFilter}
            placeholder="Buscar por nombre, DNI o teléfono..."
            minChars={2}
          />
        </div>

        <div className="grid gap-3">
          {filteredAccounts.map((account) => (
            <Card
              key={account.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setSelectedAccountId(account.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {account.nationalId || 'Sin DNI/NIE'}
                      {account.phone ? ` · ${account.phone}` : ''}
                    </p>
                    {account.notes ? (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {account.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredAccounts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No se encontraron titulares
            </p>
          )}
        </div>

        {selectedAccountId && (
          <EditOwnerForm
            accountId={selectedAccountId}
            onClose={() => setSelectedAccountId(null)}
            onSuccess={() => setSelectedAccountId(null)}
          />
        )}
      </div>
    </PageContainer>
  )
}
