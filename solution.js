{
    init: function(elevators, floors) {
        //functional-ish attempt
        
        //floor voting stuff
        var floorCounter = function(votes, floorNum) {
            if (typeof votes[floorNum] == 'undefined') {
                votes[floorNum] = 1;
            } else {
                votes[floorNum] = votes[floorNum] +1;
            }
            return votes;
        };
        var floorVote = function(objA, objB) {
            var objC = {};
            for (var attrname in objA) { objC[attrname] = objA[attrname]; };
            for (var attrname in objB) { 
                if (typeof objC[attrname] == 'undefined') { 
                    objC[attrname] = objB[attrname]; 
                }else{
                    objC[attrname] = objC[attrname] + objB[attrname];
                }
            }
            return objC;
        };
        var votedFloor = function(floorVote, floorCounter) {
            return function(listA, listB) {
                var options = floorVote(listA.reduce(floorCounter,{}), listB.reduce(floorCounter,{}));
                return Object.keys(options)
                    .reduce(function(voted, optionKey){
                    if(options[optionKey] > voted[1]) {
                        voted = [optionKey, options[optionKey]];
                    }
                    return voted
                },[0,0])
            }
        };
        
        //elevator actions
        var elevatorActions = [
            function(state) {
                return function(elevator) {
                    elevator.on("idle", function(){
                        var self = this;
                        var floor = Number(votedFloor(floorVote, floorCounter)(state.floorUp, state.floorDown)[0]);
                        self.goToFloor(floor);

                    });
                }
            },
            function(state) {
                return function(elevator) {
                    elevator.on("floor_button_pressed", function(floorNum){
                        var self = this;
                       self.goToFloor(floorNum);
                    })
                }
            },
            function(state) {
                return function(elevator) {
                    elevator.on("passing_floor", function(floorNum, direction){
                        var self = this;
                        if(direction == 'up') {
                            if(state.floorUp.indexOf(floorNum) != -1) {
                                self.goToFloor(floorNum, true);
                            }
                        } else {
                            if(state.floorDown.indexOf(floorNum) != -1) {
                                self.goToFloor(floorNum, true);
                            }
                        }
                    })
                }
            },
            function(state) {
                return function(elevator) {
                    elevator.on("stopped_at_floor", function(floorNum){
                        var self = this;
                        console.log(state.floorDown);
                        console.log(state.floorUp);
                        state.floorDown = state.floorDown.indexOf(floorNum) == -1 ?
                            state.floorDown :
                            state.floorDown.filter(function(qFloorNum){ return floorNum != qFloorNum});
                        state.floorUp = state.floorUp.indexOf(floorNum) == -1 ?
                            state.floorUp :
                            state.floorUp.filter(function(qFloorNum){ return floorNum != qFloorNum});
                    })
                }
            }
            
        ];
        
        //floor actions
        
        var floorActions = [
            function(state) {
                return function(floor) {
                    floor.on("up_button_pressed", function(){
                        var self = this;
                        state.floorUp.push(self.floorNum());
                    });
                }
            },
            function(state) {
                return function(floor) {
                    floor.on("down_button_pressed", function(){
                        var self = this;
                        state.floorDown.push(self.floorNum());
                    })
                }
            }
        ]; 
        
        // action setter
        var setAction = function(gameItem) {
            return function(action) {
                action(gameItem);
                return gameItem;
            }
        }
        
        //set initial state
        var state = {elevators: elevators, floors:floors, floorUp:[], floorDown:[], };
        
        state.elevators.map(function(elevator) {
                var set = setAction(elevator);
                elevatorActions.map(function(action) {
                    set(action(state));
                })
            });
        state.floors.map(function(floor){
            var set = setAction(floor);
            floorActions.map(function(action){
                set(action(state));
            })
        });
            
            
        
        
        
    },
    update: function(dt, elevators, floors) {
        
    }
}
