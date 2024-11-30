import bcrypt from 'bcrypt';

// Número de rounds para gerar o salt (quanto maior, mais seguro, mas mais lento)
const saltRounds = 10;

export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

export async function isValidPassword(password: string, currentPassword: string) {

    return await bcrypt.compare(password, currentPassword);
}