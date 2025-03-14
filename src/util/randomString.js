export function randomString(amount) {
    let result;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWSYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < amount; i++) {
        result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
}