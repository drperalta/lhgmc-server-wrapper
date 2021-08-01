const getFormattedTime = (unixTime) => {
    return new Date(unixTime).toLocaleTimeString("en-US")
}

module.exports = {
    getFormattedTime
}