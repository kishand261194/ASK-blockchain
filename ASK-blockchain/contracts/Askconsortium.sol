pragma solidity >=0.5.0;
contract Askconsortium {

    struct Airline {
        uint escrow;
        bool active;
    }

    struct Request {
            bytes32 toAirline;
            uint noOfSeats;
            bytes32 flightNumber;
    }

    struct Response {
            bytes32 toAirline;
            uint noOfSeats;
            bytes32 flightNumber;
            uint done;
    }

    address payable public chairperson;

    mapping(address => Airline) airlines;
    mapping(address => Response) responses;
    mapping(address => Request) requests;

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

    modifier checkEscrow(){
        require(msg.value >= 5 ether, 'need to atleast 5 ether');
        _;
    }

    event Deposit(
      address from,
      uint value
    );

    constructor() public payable {
        chairperson = msg.sender;
        airlines[chairperson].active = true;
        airlines[chairperson].escrow = msg.value;
    }


    function register() public checkEscrow checkNotIfactive payable{
        airlines[msg.sender].active = true;
        airlines[msg.sender].escrow = msg.value;
    }

    function unregister(address payable airline) public checkIfadmin payable{
        require(airlines[airline].active, 'User not active');
        airlines[airline].active = false;
        airline.transfer(airlines[airline].escrow);
    }


    function settlePayment(address payable toAirline) public payable {
        /// both airlines must be active
        require(airlines[msg.sender].active  && airlines[toAirline].active);
        toAirline.transfer(msg.value);
        //airlines[toAirline].escrow+=msg.value;
    }

    function request(bytes32 toAirline, uint noOfSeats,
                    bytes32 flightNumber) public checkIfactive{
                    requests[msg.sender].toAirline = toAirline;
                    requests[msg.sender].noOfSeats = noOfSeats;
                    requests[msg.sender].flightNumber = flightNumber;
    }

    function response(bytes32 toAirline, uint noOfSeats,
                    bytes32 flightNumber, uint done) public checkIfactive{
                    responses[msg.sender].toAirline = toAirline;
                    requests[msg.sender].noOfSeats = noOfSeats;
                    requests[msg.sender].flightNumber = flightNumber;
                    responses[msg.sender].done = done;
    }


    function replenish() public checkIfactive payable{
        airlines[msg.sender].escrow += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function viewBalance() public checkIfactive view returns (uint) {
        return airlines[msg.sender].escrow;
    }


}
