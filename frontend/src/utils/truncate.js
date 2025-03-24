export function truncate(str, length) {
    if (str === undefined) {
        return null;
    } else {
        if (str.length > length) {
            const end = str.lastIndexOf(" ", 11);
            
            return end === -1
                ? str.substring(0, length)
                : `${str.substring(0, end)}`;
        }
        return str;
    }
}
