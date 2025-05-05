const lots = [];

class Lot {
    static STATUS_ACTIVE = true;
    static STATUS_INACTIVE = false;

    constructor(
        id,
        title,
        description,
        startPrice,
        currentPrice,
        status,
        startTime,
        endTime,
        userId,
        image
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startPrice = startPrice;
        this.currentPrice = currentPrice;
        this.status = status;
        this.startTime = new Date(startTime);
        this.endTime = new Date(endTime);
        this.userId = userId;
        this.image = image;
    }
}

module.exports = { Lot, lots };
