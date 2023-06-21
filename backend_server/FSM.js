const { createMachine, interpret } = require('xstate');

const roverMachine = createMachine(
    {
        id: 'rover',
        initial: 'movingForward',
        states: {
            movingForward: {
                on: {
                    SENSOR_READING: [
                        {
                            target: 'turnRight',
                            cond: 'shouldTurnRight',
                        },
                        {
                            target: 'makeNode',
                            cond: 'shouldMakeNode',
                        },
                        {
                            target: 'uTurn',
                            cond: 'shouldUTurn',
                        },
                        {
                            target: 'movingForward',
                        },
                    ],
                },
            },
            turnRight: {
                entry: 'turnRightAction',
                on: {
                    SENSOR_READING: [
                        {
                            target: 'movingForward',
                            cond: 'shouldMoveForward',
                        },
                        {
                            target: 'turnRight',
                        },
                    ],
                },
            },
            makeNode: {
                entry: 'makeNodeAction',
                on: {
                    SENSOR_READING: [
                        {
                            target: 'movingForward',
                            cond: 'shouldMoveForward',
                        },
                        {
                            target: 'turnRight',
                            cond: 'shouldTurnRight',
                        },
                    ],
                },
            },
            uTurn: {
                entry: 'uTurnAction',
                on: {
                    SENSOR_READING: [
                        {
                            target: 'movingForward',
                            cond: 'shouldMoveForward',
                        },
                        {
                            target: 'turnRight',
                            cond: 'shouldTurnRight',
                        },
                        {
                            target: 'uTurn',
                            cond: 'shouldUTurn',
                        },
                    ],
                },
            },
            continueForward: {
                entry: 'continueForwardAction',
                on: {
                    SENSOR_READING: [
                        {
                            target: 'turnRight',
                            cond: 'shouldTurnRight',
                        },
                        {
                            target: 'makeNode',
                            cond: 'shouldMakeNode',
                        },
                        {
                            target: 'continueForward',
                        },
                    ],
                },
            },
        },
    },
    {
        guards: {
            shouldTurnRight: (context, event) => {
                const { L, R, F, FL, FR } = event.sensorData;

                return L && R && !F && (FL !== FR);
            },
            shouldMakeNode: (context, event) => {
                const { L, R, F, FL, FR } = event.sensorData;

                return L && R && !F && !(FL !== FR);
            },
            shouldUTurn: (context, event) => {
                const { L, R, F, FL, FR } = event.sensorData;

                return L && R && F && !(FL !== FR);
            },
            shouldMoveForward: (context, event) => {
                const { L, R, F } = event.sensorData;

                return L && R && !F;
            },
            shouldContinueForward: (context, event) => {
                const { L, R, F, FL, FR } = event.sensorData;
                return L && R && !F && !(FL !== FR);
              },
        },
        actions: {
            turnRightAction: () => {
                console.log('Turn Right');
                // Perform turn right action here
            },
            makeNodeAction: () => {
                console.log('Make Node');
                // Perform make node action here
            },
            uTurnAction: () => {
                console.log('U-Turn');
                // Perform U-turn action here
            },
            continueForwardAction: (context, event) => {
                console.log('Continue Forward Action');
            },
        },
        predictableActionArguments: true,
    }
);

// Create an instance of the state machine interpreter
const roverInterpreter = interpret(roverMachine)
    .onTransition((state) => console.log('Current State:', state.value))
    .start();

// Send sensor readings to trigger state transitions
roverInterpreter.send({
    type: 'SENSOR_READING',
    sensorData: {
        L: true,
        R: true,
        F: true,
        FL: true,
        FR: true,
    },
});
console.log("Step 1 executed")

roverInterpreter.send({
    type: 'SENSOR_READING',
    sensorData: {
        L: true,
        R: true,
        F: false,
        FL: true,
        FR: true,
    },
});
console.log("Step 2 executed")

roverInterpreter.send({
    type: 'SENSOR_READING',
    sensorData: {
        L: true,
        R: true,
        F: false,
        FL: true,
        FR: true,
    },
});
