export function generateID() {
    const buffer = new BigUint64Array(1);
    crypto.getRandomValues(buffer);
    return buffer.toString();
}
