export const SETTINGS_API = {
  getOne: () => ({
    url: '/v1/setting',
    method: 'GET' as const,
  }),

  update: (id: number) => ({
    url: `/v1/setting/update/${id}`,
    method: 'PUT' as const,
  }),
}
