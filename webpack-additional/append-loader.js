module.exports = function (source) {
    const options = this.getOptions();

    return `${options.append}${source}`
}


