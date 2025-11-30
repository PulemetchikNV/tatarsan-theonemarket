import { mockDashboardDelay, mockCompanyDelay } from '../__mocks__'
import type { ROLES } from '../const'
import { FEATURES } from '../const'

export type DashboardResponse = {
    htmlComponents: string
    totalHealthScore: number
}

export type CompanyResponse = {
    name: string
    industry: string
    htmlComponents: string
}

const IS_MOCKING_API = FEATURES.IS_MOCK_ENABLED

export const useApi = () => {
  const getDashboard = async ({ role, query }: { role: keyof typeof ROLES, query: string }): Promise<DashboardResponse> => {
    if (IS_MOCKING_API) {
      return mockDashboardDelay()
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const url = new URL(`${apiUrl}/api/v1/dashboard${FEATURES.IS_LANGGRAPH_ENABLED ? '/langgraph' : ''}`)
    url.searchParams.set('role', role)
    url.searchParams.set('query', query)
    
    const response = await fetch(url.toString())
    return response.json()
  }

  const getCompany = async (companyName: string): Promise<CompanyResponse> => {
    if (IS_MOCKING_API) {
      return mockCompanyDelay(companyName)
    }
    
    const response = await fetch(`http://localhost:3000/api/v1/company/${companyName}`)
    return response.json()
  }

  return {
    getDashboard,
    getCompany,
  }
}