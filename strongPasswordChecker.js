// https://leetcode.com/problems/strong-password-checker/
const cond1 = "bbaaaaaaaaaaaaaaacccccc"; // expected 8
const cond2 = "aaaaAAAAAA000000123456"; // expected 5
const cond3 = "aaaabbbbccccddeeddeeddeedd"; //expected 8
const cond4 = "QQQQQ"; // expected 2
const cond5 = "..................!!!" // expected 7
const cond6 = "aaaabbaaabbaaa123456A"; //expected 3
"aaaabbaaabbaaa123456A";
console.log(cond6.length);

// Functions for checking if pw contains a lower, upper, or numeric char
const hasLowerAlpha = str => {
    let code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (code > 96 && code < 123) {
            return true;
        }
    }
    return false;
}
const hasUpperAlpha = str => {
    let code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (code > 64 && code < 91) {
            return true;
        }
    }
    return false;
}
const hasNumber = str => {
    let code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (code > 47 && code < 58) {
            return true;
        }
    }
    return false;
}

// Element for storing in queue.  Holds the string ele, priority, and original string (ele gets mutated)
class QEle {
    constructor(ele, prio, os) {
        this.ele = ele;
        this.prio = prio;
        this.os = os;
    }
}
// Priority Queue
class PrioQue {
    constructor() {
        this.subStrings = [];
    }

    enqueue(ele, prio, os) {
        const qEle = new QEle(ele, prio, os);
        let contain = false;
        // Determine where element goes in queue list by priorty. Currently lower number = higher prio (using modulus to see how divisible by 3 a number is)
        // Aka if divisible by 3, priority will be 0 and that is highest.  2 is lowest.
        // We do this because we can cut the number of steps by 2 in a single action if we delete a letter from a continuous substring that is divisible by 3.
        // for instance, normally if we have 6 cons letters, thats 2 actions to change 2 letters so that we dont have 3 in a row, plus however many needs to be deleted.  But if we're on the delete step and delete
        // one of these letters so it is 5 cons letters, then it only takes 1 step of changing a letter (the one in middle thus leaving 2 substrings of 2 in a row)
        for (let i = 0; i < this.subStrings.length; i++) {
            if (this.subStrings[i].prio > qEle.prio) {
                this.subStrings.splice(i, 0, qEle);
                contain = true;
                break;
            }
        }
        // Push to end if wasnt added above
        if (!contain) {
            this.subStrings.push(qEle);
        }
    }

    dequeue() {
        if (this.isEmpty()) return 'Empty';
        return this.subStrings.shift();
    }

    isEmpty() {
        return this.subStrings.length === 0;
    }
}
// Function for handling 3+ consecutive letters/digits
const checkForThreeConsDigits = function(password) {
    let incSteps = 0;
    let arrOfQueItems = [];
    
    // If password is longer than 20 chars, we need to delete some. Ideally we delete letters from any instances of 3+ cons chars.
    // We use a prio queue for deleting the instances with 3+ cons chars in a way that results in the least steps later on for replacing chars.
    // For example, we need to delete a char in a cons substring of length 6 before a char in a cons substring on length 5.  look at the example abbbbbaacccccc.
    // bbbbb needs 1 step to change to bbvbb to work. It still only needs 1 step if you delete a b to bbbb (bbvb).  But if we instead delete a c, we go from
    // cccccc needing 2 steps with something like ccTccT to a cons string of 5 letters ccccc, which only needs 1 step of ccTcc, for a combined total of 2 steps instead of 3.
    if (password.length > 20) {
        const prioQue = new PrioQue();
        let toDelete = password.length - 20;

        // Build each continuous char substring and enqueue with prio using length % 3.
        for (let i = 0; i < password.length - 2; i++) {
            if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
                let currString = password[i] + password[i + 1] + password[i + 2];
                i += 2;
                while (password[i] === password[i + 1] && i < password.length) {
                    currString += password[i + 1];
                    i++;
                }
                prioQue.enqueue(currString, currString.length % 3, currString);
            }
        }

        // As long as we need to delete chars (length > 20) and the prioqueue isnt empty, keep deleting chars from the substrings in order of prio.
        while (toDelete && !prioQue.isEmpty()) {
            const firstEle = prioQue.dequeue();
            // Cut off the third element of string. 3rd ele is most effecient in all scenarios. aaa, aaaa, aaaaa.  Cutting off the first causes more steps in aaaa and aaaaa.
            firstEle.ele = firstEle.ele.slice(0, 2) + firstEle.ele.slice(3);
            // Increase steps now that we deleted a char
            incSteps++;
            // If the length is still > 2, add it back to queue as it cam still be a candidate for more deletions based on its prio and remaining toDelete count.
            // If queue runs out before toDelete, it's fine, rest gets removed in the strongPAsswordChecker function body.
            if (firstEle.ele.length > 2) prioQue.enqueue(firstEle.ele, firstEle.ele.length % 3, firstEle.os);
            // If string length is less than 3, we just add it to an arr of queue items that we will replace parts of the string with.
            else arrOfQueItems.push(firstEle);
            toDelete--;
        }
        // Add any remaining que items to our array since we still need to replace our password segments with them.
        for (const ele of prioQue.subStrings) {
            arrOfQueItems.push(ele);
        }
        // Make sure the os are sorted shortest to longest to ensure the correct string building below
        arrOfQueItems.sort((a, b) => a.os.length - b.os.length);
        // Loop through queue items and replace the password cons substrings with the shortened versions.
        // We need to actually replace them instead of just increment steps due to need to go through and check for remaining cons substrings if they were > chars to be deleted.
        for (const ele of arrOfQueItems) {
            for (let i = 0; i < password.length; i++) {
                // Check to make sure we are on the correct substring to replace (or one that is the same).  Need shortest os to acheive in this manner.
                if (password.substring(i, i + ele.os.length) === ele.os && password[i] !== password[i + ele.os.length] && password[i - 1] !== password[i]) {
                    password = password.slice(0, i) + ele.ele + password.slice(i + ele.os.length);
                    break;
                }
            }
        }
    }

    // Now reloop through and check for any remaning 3+ cons substrings after string is >= 20 chars (or if it started that way)
    for (let i = 0; i < password.length - 2; i++) {
        if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]){
            if (!hasUpperAlpha(password)) {
                password = password.slice(0, i + 2) + "Z" + password.slice(i + 3);
                incSteps++;
                i += 2;
                continue;
            }
            if (!hasLowerAlpha(password)) {
                password = password.slice(0, i + 2) + "z" + password.slice(i + 3);
                incSteps++;
                i += 2;
                continue;
            }

            if (!hasNumber(password)) {
                if (isNaN(password[i + 2])) {
                    password = password.slice(0, i + 2) + "1" + password.slice(i + 3);
                    incSteps++;
                    i += 2;
                    continue;
                }
            }

            incSteps++;
            // For a min case, the third letter would be changed, so increase i to the third letter.
            i += 2;
        }
    }
    return {incSteps, password};
}

/**
 * @param {string} password
 * @return {number}
 */
var strongPasswordChecker = function(password) {
    let steps = 0;
    const len = password.length;
    
    if (len < 6) {
        steps += (6 - len);
        if (len === 5) {
            if (
                (!hasNumber(password) && !hasUpperAlpha(password))
                || (!hasNumber(password) && !hasLowerAlpha(password))
            ) {
                steps++;
            }
        }
        return steps;
    }
    
    if (len > 20) {
        // Check for cons digits first since we can remove them at same time as fixing that.
        const {incSteps, password: newPassword} = checkForThreeConsDigits(password);
        steps += incSteps;
        
        password = newPassword;
        steps += (newPassword.length - 20);

        if (!hasLowerAlpha(password)) {
            steps++;
        }
        if (!hasUpperAlpha(password)) {
            steps++;
        }
        if (!hasNumber(password)) {
            steps++;
        }

        return steps;
    }
    
    const {incSteps} = checkForThreeConsDigits(password);
    
    if (incSteps) {
        steps += incSteps;
        return steps;
    }
    
    if (!hasLowerAlpha(password)) {
        steps++;
        return steps;
    }
    if (!hasUpperAlpha(password)) {
        steps++;
        return steps;
    }
    if (!hasNumber(password)) {
        steps++;
        return steps;
    }
    
    return steps;
};

console.log(strongPasswordChecker(cond1));
console.log(strongPasswordChecker(cond2));
console.log(strongPasswordChecker(cond3));
console.log(strongPasswordChecker(cond4));
console.log(strongPasswordChecker(cond5));
console.log(strongPasswordChecker(cond6));