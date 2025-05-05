const offers = [];

class Offer {
    constructor(id, lotId, userId, offerPrice) {
        this.id = id;
        this.lotId = lotId;
        this.userId = userId;
        this.offerPrice = offerPrice;
    }
}

module.exports = { Offer, offers };
