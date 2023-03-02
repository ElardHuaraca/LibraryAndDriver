import { ElementHandle } from "puppeteer";

ElementHandle.prototype.isVisible = async function () {
    return (await this.boundingBox() !== null);
}