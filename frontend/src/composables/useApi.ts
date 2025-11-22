export type DashboardResponse = {
    htmlComponents: string
    totalHealthScore: number
    
}

export const useApi = () => {
  const getDashboard = async () => {
    const response = await fetch('generateDashboard')
    return response.json() as Promise<DashboardResponse>
  }

  const getCompany = async (companyName: string) => {
    const response = await fetch(`/api/v1/company/${companyName}`)
    return response.json()
  }

  return {
    getDashboard,
    getCompany,
  }
}