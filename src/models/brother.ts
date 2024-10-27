export type brother = {
    id: number
    active: boolean
    brother_name: string
    active_tpl: boolean,
    sex: string,
    families?: brother[],
    tpl_times?: string
}