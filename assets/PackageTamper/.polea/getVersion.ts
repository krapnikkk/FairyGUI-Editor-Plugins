export function getversion() {
    let date = new Date();
    return date.getMonth() + "." + date.getDay() + "." + date.getHours() + date.getMinutes();
}
