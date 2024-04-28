export function getNear(numTerritorio: number) {
    const list: { [key: number]: number[] } = {
        1: [2, 3, 4],
        2: [1, 3, 4, 8],
        3: [1, 2, 4, 5, 6],
        4: [1, 2, 3, 5, 6, 7, 9],
        5: [3, 4, 6, 10],
        6: [3, 4, 5, 7, 9, 10],
        7: [4, 6, 9, 10, 11, 43, 45],
        8: [2, 4, 9],
        9: [2, 4, 6, 7, 8, 43, 44, 45],
        10: [5, 4, 7, 11, 45],
        11: [7, 10, 12, 13, 19, 45],
        12: [13, 14, 15, 16, 19],
        13: [11, 12, 19],
        14: [12, 15, 17],
        15: [12, 14, 16, 17, 19, 41],
        16: [12, 15, 17, 18, 19, 22, 41],
        17: [14, 15, 16, 22, 41],
        18: [16, 19, 22],
        19: [11, 12, 13, 16, 15, 22, 23, 24, 26],
        20: [21, 22, 25],
        21: [20, 22, 24, 25, 28],
        22: [16, 17, 18, 19, 20, 21, 23, 24, 41],
        23: [19, 21, 22, 24, 26],
        24: [19, 21, 23, 25, 26, 28],
        25: [20, 21, 24, 28, 29],
        26: [19, 23, 24, 27, 28, 30, 31, 34, 35],
        27: [26, 28, 29, 30, 31],
        28: [21, 24, 25, 26, 27, 29, 30],
        29: [25, 27, 28, 30],
        30: [26, 27, 28, 29, 31],
        31: [26, 27, 30, 32, 33, 34, 35],
        32: [31, 33, 36],
        33: [31, 32, 34, 35, 36],
        34: [26, 31, 35, 36, 37],
        35: [26, 31, 33, 34, 36, 37],
        36: [33, 32, 34, 35, 37, 38, 39, 40],
        37: [34, 35, 36, 38, 39, 40],
        38: [36, 37, 39, 40],
        39: [36, 37, 38, 40],
        40: [36, 37, 38, 39],
        41: [15, 16, 17, 22],
        42: [43, 44],
        43: [9, 42, 44, 45],
        44: [9, 42, 43],
        45: [7, 9, 10, 11, 42, 43]
    }

    return list[+numTerritorio]

}



export function checkNearTerritories(territories: number[]): boolean {
    for (const territoryId of territories) {
        const nears = getNear(territoryId);
        // Verifica se todos os IDs dos outros territórios estão presentes nos nears
        for (const otherTerritoryId of territories) {
            if (territoryId !== otherTerritoryId && !nears.includes(otherTerritoryId)) {
                return false; // Retorna false se algum ID não estiver presente nos nears
            }
        }
    }
    return true; // Retorna true se todos os IDs estiverem presentes nos nears de seus respectivos territórios
}
