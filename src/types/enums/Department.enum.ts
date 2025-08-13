export const DepartmentValues = {
    DEVELOPMENT: 'Desarrollo',
    TECHNICAL_SUPPORT: 'Soporte Técnico',
    SALES: 'Ventas',
    MARKETING: 'Marketing',
} as const;

export type Department = typeof DepartmentValues[keyof typeof DepartmentValues];