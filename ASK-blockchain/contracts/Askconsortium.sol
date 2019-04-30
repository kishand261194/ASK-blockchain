pragma solidity >=0.5.0;
contract Askconsortium {

    struct Airline {
        uint escrow;
        bool active;
    }

    address public chairperson;

    mapping(address => Airline) airlines;

    modifier checkIfactive(){
        require(airlines[msg.sender].active, 'user is not active');
        _;
    }

        modifier checkNotIfactive(){
        require(!airlines[msg.sender].active, 'user is active');
        _;
    }


    modifier checkIfadmin(){
        require(msg.sender == chairperson, 'user is not an admin');
        _;
    }



    constructor() public payable {
        chairperson = msg.sender;
        airlines[chairperson].active = true;
        airlines[chairperson].escrow = msg.value;
    }


    function register() public payable checkNotIfactive{
        airlines[msg.sender].active = true;
        airlines[msg.sender].escrow = msg.value;
    }

    function unregister(address airline) public {
        require(msg.sender == chairperson);
        require(airlines[airline].active);
        airlines[airline].active = false;
    }

    function viewBalance() public view returns (uint) {
        /// user must be active
        require(airlines[msg.sender].active);
        return airlines[msg.sender].escrow;
    }


}
