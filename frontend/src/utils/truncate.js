export function truncate(str, length) {
    if (str === undefined) {
        return null;
    } else {
        if (str.length > length) {
            const end = str.lastIndexOf(" ", 11);
            
            if (end === -1) {
                return str.substring(0, length);
            } else {
                return `${str.substring(0, end)}`;
            }
        }
        return str;
    }
}
