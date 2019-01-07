pragma solidity ^0.5.0;

contract BagCount {
    
    //used to record a delivery
    struct Delivery {
        address center;
        uint bagCount;
        uint dateTimeStamp;
        bool verified;
        uint plantCount;
    }
    
    //initial creator of the contract
    address public recyclingPlant;
    
    //each center address is mapped to a discrepancy tracker
    mapping(address => uint) discrepancies;

    //each delivery is given a unique ID
    uint private deliveryId;

    //use to map the delivery ID to the specific delivery
    mapping(uint => Delivery) deliveries;
    
    //modifies methods so they can only be called by the plant
    modifier restricted() {
        require(msg.sender == recyclingPlant, "Only plant account can modify this data");
        _;
    }
    
    //constructor function which assigns the value of the plant to the creator
    constructor() public {
        recyclingPlant = msg.sender;
        deliveryId = 1;
    }

    //initializes a new center with a discrepancy of 0
    function createCenter() public {
        discrepancies[msg.sender] = 0;
    }

    event LogCenterDelivery(
        address _center, uint _id
    );

    event LogDeliveryInfo(
        address center, uint bagCount, uint dateTimeStamp, bool verified, uint plantCount
    );

    event LogDiscrepancies(
        uint discrepancies
    );

    //called by centers to record a count, returns the index of that count
    function recordCount(uint newCount) public {
        Delivery memory newDelivery = Delivery({
            center: msg.sender,
            bagCount: newCount,
            dateTimeStamp: now,
            verified: false,
            plantCount: 0
        });
        deliveries[deliveryId] = newDelivery;
        deliveryId++;
        emit LogCenterDelivery(msg.sender,deliveryId);
    }

    //plug in the index from the delivery to get details
    function getCount(uint requestedId) public {
        Delivery memory d = deliveries[requestedId];
        emit LogDeliveryInfo(d.center, d.bagCount, d.dateTimeStamp, d.verified, d.plantCount);
    }
    
    //plant can verify a delivery
    function verifyDelivery(uint requestedId, uint verifiedCount) public restricted {
        Delivery storage delivery = deliveries[requestedId];
        delivery.verified = true;
        delivery.plantCount = verifiedCount;
        if (delivery.plantCount != delivery.bagCount) {
            _addDiscrepancy(delivery.center, delivery.bagCount - delivery.plantCount);
        }
    }
    
    //verifying a count will record a discrepancy count to track the total discrepancy over time
    function _addDiscrepancy(address center, uint difference) private {
        discrepancies[center] += difference;
    }

    //shows the total discrepancy at a particular center
    function getDiscrepancies(address center) public {
        emit LogDiscrepancies(discrepancies[center]);
    }
}