export const downloadFile = (fileName, urlData) => {
    var aLink = document.createElement('a');
    aLink.download = fileName;
    aLink.href = urlData;

    var event = new MouseEvent('click');
    aLink.dispatchEvent(event);
}

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}