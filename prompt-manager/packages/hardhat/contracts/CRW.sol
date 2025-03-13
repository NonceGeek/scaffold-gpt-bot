// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title CRW
 * @dev Create, Read, Write.
 */
contract CRW {
    // Define a struct for the data
    struct DataItem {
        string content;
        uint256 timestamp;
    }
    
    // Mapping from address to array of items
    mapping(address => DataItem[]) private addressToItems;
    
    /**
     * @dev Add an item under the sender's address
     * @param data The content to store
     */
    function add_item(string memory data) public {
        DataItem memory newItem = DataItem({
            content: data,
            timestamp: block.timestamp
        });
        
        addressToItems[msg.sender].push(newItem);
    }
    
    /**
     * @dev Read all items under a specific address
     * @param addr The address to read items from
     * @return An array of all items stored under the address
     */
    function read_all(address addr) public view returns (DataItem[] memory) {
        return addressToItems[addr];
    }
    
    /**
     * @dev Get all indices for items under a specific address
     * @param addr The address to get indices for
     * @return An array of indices
     */
    function read_index(address addr) public view returns (uint256) {
        uint256 itemCount = addressToItems[addr].length;
        return itemCount;
    }
    
    /**
     * @dev Get a specific item by index under an address
     * @param addr The address to read from
     * @param index The index of the item
     * @return The requested item
     */
    function read_item(address addr, uint256 index) public view returns (DataItem memory) {
        require(index < addressToItems[addr].length, "Index out of bounds");
        return addressToItems[addr][index];
    }
}