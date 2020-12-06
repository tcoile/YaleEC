const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cloneDeep = require('lodash.clonedeep');

admin.initializeApp();

const db = admin.firestore();
const orgCollectionName = "organizations";

// on create, filter the tags and then put it into the tree structure
exports.addOrg = functions.firestore
    .document(orgCollectionName + '/{orgId}')
    .onCreate(async (snap, context) => {
        // we want to reduce the number of tags in the org
        let oldTags = snap.data().tags;
        let newTags = [];
        for(let i = 0; i < oldTags.length; i++) {
            if(!newTags.includes(oldTags[i])) {
                newTags.push(oldTags[i].trim());
            }
        }
        if(newTags.length !== oldTags.length) {
            // update the document with reduced tags
            snap.ref.set({ tags: newTags}, {merge: true});
        }
        return await makeHierarchy(orgCollectionName);
    })

async function makeHierarchy(collectionName) {
    // get all the org data as an array
    let allOrgs = []
    let querySnapshot = await db.collection(collectionName).get()
    querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
        allOrgs.push(doc.data());
    });

    // now we have to translate the entire data function
    let map = {};
    let treeData = parseDataHelper(allOrgs, [], true, map);
    let success = false;
    await db.collection("admin").doc("treeData").set({
        data: JSON.stringify(treeData)
    })
    .then(() => {
        success = true;
        return;
    })
    .catch((error) => {
    });
    return success;
}

function parseDataHelper(data, ancestralTags, topLevel, supersetMap) {
    const keyedData = [];
    for(let i = 0; i < data.length; i++) {
        const elem = data[i];
        let seenTags = [];
        for(let j = 0; j < data[i].tags.length; j++) {
            // if a tag has already been generated, don't do it again
            if(!seenTags.includes(data[i].tags[j])) {
                // if the tag is the parent's key, we don't want to generate it unless 
                // it doesn't have any other tags
                if(!ancestralTags.includes(data[i].tags[j])) {
                    const clonedElem = cloneDeep(elem);
                    clonedElem.key = data[i].tags[j];
                    keyedData.push(clonedElem);
                    seenTags.push(data[i].tags[j]);
                }
            }
        }
        // if this didn't have any tags other than the parent, then generate it once with the parent tag
        if(seenTags.length === 0) {
            const clonedElem = cloneDeep(elem);
            clonedElem.key = ancestralTags[ancestralTags.length - 1];
            keyedData.push(clonedElem);
        }
    }
    const groupedData = {}
    // replicating the d3 group function, creating a map with keys and array of obj with that key
    for(let i = 0; i < keyedData.length; i++) {
        let key = keyedData[i].key;
        if(groupedData[key] !== undefined) {
            groupedData[key].push(keyedData[i]);
        } else {
            groupedData[key] = [keyedData[i]];
        }
    }
    // replicating the Array.from behavior to make array out of map
    const keys = Object.keys(groupedData);
    const groupDataArray = [];
    for(let i = 0; i < keys.length; i++) {
        groupDataArray.push({name: keys[i], children: groupedData[keys[i]]})
    }    
    let recursiveThreshold = 5;
    mergeSupersets(groupDataArray, topLevel, supersetMap);
    // and now we want to cull it so that groups that only have one member are connected directly to the parent again
    // first find the group that only has that tag
    let parentTag = ancestralTags[ancestralTags.length - 1];
    let onlyParentTag = 0;
    if(groupDataArray[onlyParentTag].name !== parentTag) {
        onlyParentTag = -1;
        for(let i = 0; i < groupDataArray.length; i++) {
            if(groupDataArray[i].name === parentTag) {
                onlyParentTag = i;
                break;
            }
        }
    }
    for(let i = 0; i < groupDataArray.length; i++) {
        if(groupDataArray[i].children.length === 1 && i !== onlyParentTag) {
            // change key to parent key
            groupDataArray[i].children[0].key = parentTag;
            // put it into the only tag group
            if(onlyParentTag === -1) {
                groupDataArray.push({name: parentTag, children: []});
                onlyParentTag = groupDataArray.length - 1;
            }
            groupDataArray[onlyParentTag].children.push(groupDataArray[i].children[0]);
            // then delete that one
            groupDataArray.splice(i, 1);
            if(i < onlyParentTag) {
                onlyParentTag--;
            }
            i--;
        }
    }

    if(groupDataArray.length > recursiveThreshold) {
        for(let i = 0; i < groupDataArray.length; i++) {
            if(groupDataArray[i].name !== ancestralTags[ancestralTags.length - 1]) {
                // don't want to do it again for the parent tag itself
                let newTags = ancestralTags.concat([groupDataArray[i].name])
                groupDataArray[i].children = parseDataHelper(groupDataArray[i].children, newTags, false, supersetMap);
            }
        }
    } 
    
    // and then we want to pull all the ones in the parent tag group to the parent tag itself
    if(onlyParentTag !== -1) {
        let onlyParentArray = groupDataArray[onlyParentTag].children;
        groupDataArray.splice(onlyParentTag, 1);
        // then put all of its children into the parent children
        for(let i = 0; i < onlyParentArray.length; i++) {
            groupDataArray.push(onlyParentArray[i]);
        }
    }

    return groupDataArray;
}

/* map takes form of 
{
    parentName: [child, child, child],
    parentName: [child, child]
}
*/
function makeSupersetMap(map, parent, child) {
if(map[parent] === undefined) {
    map[parent] = [child];
} else {
    map[parent].push(child);
}
}

function checkSupersetMap(map, parent, child) {
    if(map[parent] === undefined) {
        return true;
    } else if(map[parent].includes(child)) {
        return true;
    }
    return false;
}

function changeChildKeys(array, key) {
    for(let i = 0; i < array.length; i++) {
        array[i].key = key;
    }
}

function mergeSupersets(groupDataArray, topLevel, map) {
    // Check for supersets
    let i = 0; 
    while(i < groupDataArray.length - 1) {
        // indicates whether groupDataArray[i] has been deleted because it is contained within another group
        let subsumed = false;
        for(let j = i + 1; j < groupDataArray.length; j++) {
            let smallArrayIndex, largeArrayIndex;
            if(groupDataArray[i].children.length <= groupDataArray[j].children.length) {
                smallArrayIndex = i;
                largeArrayIndex = j;
            } else {
                smallArrayIndex = j;
                largeArrayIndex = i;
            }
            let smallArray = groupDataArray[smallArrayIndex].children;
            let largeArray = groupDataArray[largeArrayIndex].children;
            // indicates that of the two arrays, i and j, one is the superset of the other
            let smallInLarge = true;
            for(let smallIterator = 0; smallIterator < smallArray.length; smallIterator++) {
                let smallElementInLarge = false;
                // for each element in the small array, iterate through the large array
                // if the element is found, break and set smallElementInLarge to true
                for(let largeIterator = 0; largeIterator < largeArray.length; largeIterator++) {
                    if(smallArray[smallIterator].name === largeArray[largeIterator].name) {
                        smallElementInLarge = true;
                        break;
                    }
                }
                // smallInLarge takes the result of each individual element and &'s them together
                // if any one element is not found, break
                smallInLarge = smallElementInLarge;
                if(!smallInLarge) {
                    break;
                }
            }
            // if the smaller array is a subset of the larger array
            // remove the smaller array; if the smaller array is i (smaller index) 
            // delete it and continue to the next iteration of the while loop
            // if the smaller is array is j (larger index), delete it
            // continue to next iteration of the for loop, adjusting j
            if(smallInLarge) {
                // if toplevel is true, note the parent and child
                let parent = groupDataArray[largeArrayIndex].name;
                let child = groupDataArray[smallArrayIndex].name;
                if(topLevel) {
                    makeSupersetMap(map, parent, child);
                } else {
                    let superset = checkSupersetMap(map, parent, child);
                    if(smallArray.length === largeArray.length) {
                        if(superset) {
                            // if superset and same size, choose more specific tag
                            groupDataArray[largeArrayIndex].name = child;
                            changeChildKeys(largeArray, child);
                        } else {
                            // combine their names
                            groupDataArray[largeArrayIndex].name = parent + "/" + child;
                            changeChildKeys(largeArray, parent + "/" + child);
                        }
                    } else {
                        if(!superset) {
                            // if the ratio is greater than 1/3, combine their names
                            if(1/(smallArray.length / largeArray.length) < 3) {
                                groupDataArray[largeArrayIndex].name = parent + "/" + child;
                                changeChildKeys(largeArray, parent + "/" + child);
                            }
                        }
                    }
                }

                groupDataArray.splice(smallArrayIndex, 1);
                if(smallArrayIndex < largeArrayIndex) {
                    subsumed = true;
                    break;
                } else {
                    j--;
                }
            }
        }
        // if array i was not deleted this time around, increment i
        if(!subsumed) {
            i++;
        }
    }
    // directly modifies the array given to it
    return;
}

exports.deleteOrg = functions.firestore
    .document(orgCollectionName + '/{orgId}')
    .onDelete(async (snap, context) => {
        return await makeHierarchy(orgCollectionName);
    })

exports.updateOrg = functions.firestore
    .document(orgCollectionName + '/{orgId}')
    .onUpdate(async(change, context) => {
        // for now we redo the entire tree anytime something is changed
        // const oldTags = change.before.data().tags;
        // const newTags = change.after.data().tags;
        // // if the tags have been changed
        // if(!sameElements(oldTags, newTags)) {  
            
        // }
        // otherwise we want to look through the tree and update the data (is this even...worth it?)
        return await makeHierarchy(orgCollectionName);
    })

function sameElements(arr1, arr2) {
    if(arr1.length !== arr2.length) {
        return false;
    }
    for(let i = 0; i < arr1.length; i++) {
        if(!arr2.includes(arr1[i])) {
            return false;
        }
    }
    return true;
}