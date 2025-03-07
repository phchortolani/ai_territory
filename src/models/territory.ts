export interface Territory {
    id: number,
    status?: boolean,
    house_numbers?: number,
    sheets_number?: number
}

export interface ia_info_territory {
    id: number,
    last_schedule: Date
    house_numbers?: number,
    nears?: number[]
}