/* eslint-disable prettier/prettier */
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const mongoose = require('mongoose');
const http = require('https');
const superagent = require('superagent');
const axios = require('axios');
// import fs
const fs = require('fs');
//import utilty email
const sendEmail = require('../utils/email');

//import cloudinary
const cloudinary = require('../utils/cloudinary');

//import  user  model
const User = require('../models/userModel');

//import  admin  model
const Admin = require('../models/adminModel');

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res, req) => {
    const token = signToken(user._id);
    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });

    //remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

  // Convert time from milliseconds to minute
  const convertMillisecondsToMinute = async(ms) => {
    return ms / 60000;
};

const calculateDurationOfCurrentPeriodBalance = async(
    periodBalance,
    costPerMin
) => {
    let minuteAvailable = 0;
    minuteAvailable =  (periodBalance / costPerMin);
    return minuteAvailable;
};

const getTheCurrentWeek = () => {
let	currentDate = new Date();
let	startDate = new Date(currentDate.getFullYear(), 0, 1);
let currentWeek;
	let days = Math.floor((currentDate - startDate) /
		(24 * 60 * 60 * 1000));
		
	let weekNumber = Math.ceil(
		(currentDate.getDay() + 1 + days) / 7);

	// Display the calculated result	
	console.log("Week number of " + currentDate + " is : " + weekNumber);

    // console.log("Week number of " + currentDate + " is : " + currentDate.getWeek());
    currentWeek = weekNumber;

    return currentWeek;
};

const getTheCurrentDate = () => {
    let	currentDate = new Date();
    let	startDate = new Date(currentDate.getFullYear(), 0, 1);
    let todayDate;
             // Display the calculated result	
        console.log("Today date is " + currentDate.getDay());
    
        // console.log("Week number of " + currentDate + " is : " + currentDate.getWeek());
        todayDate = currentDate.getDate();
    
        return todayDate;
    };


//Get a single user and start period
exports.startPeriod = async(req, res, next) => {
    try {
        let {user_id} = req.body;
        //find  user from database by id
        // let user = await User.findById(req.params.id);
        let user = await User.findById(user_id);
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }

         //find  user from database by id
         let admin = await Admin.find();
         //check if user exists
         if (!user) {
             throw createError(404, 'Admin does not exist');
         }

        console.log('admin prop:', admin);
        // Destructure the user
        let {
            firstName,
            lastName,
            phoneNumber,
           otp,
                login,
            logout,
            lastLogin,
            lastLogout,
            periodActivationCount,
            email,
            costOfLastPeriodSession,
            durationOfLastSession,
            charges,
            isActive,
            isDeactivated,
            isInActive,
            totalPeriodUsedForThisWeek,
            periodBalance,
            allotedSlots,
            payForTheWeek,
            periodForTheWeek,
           role,
           startTime,
            stopTime,
            usage,
            periodTimeAvailableInMin,
            periodTimeRemainingInMin,
            timeUsedToday,
            timeUsedThisWeek,
            presentWeek,
            previousWeek,
            periodTimeAvailable,
            periodTimeRemaining,
        } = user;
      let presentDay =  getTheCurrentDate();
      console.log("line 129:", presentDay);
        presentWeek = getTheCurrentWeek();
        console.log("line 129:", presentWeek);

        console.log("line 131:", previousWeek);
      
        if (isDeactivated === false && presentWeek > previousWeek  ) {
            //find  user from database by id
            let user = await User.findById(req.params.id);
            console.log('user:', user);
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            // Destructure the user
            let {
                firstName,
                lastName,
                phoneNumber,
               otp,
                    login,
                logout,
                lastLogin,
                lastLogout,
                periodActivationCount,
                email,
                costOfLastPeriodSession,
                durationOfLastSession,
                charges,
                isDeactivated,
                isInActive,
                totalPeriodUsedForThisWeek,
                periodBalance,
               role,
                stopTime,
                usage,
                periodTimeAvailableInMin,
                periodTimeRemainingInMin,
                timeUsedToday,
                timeUsedThisWeek,
                presentWeek,
                previousWeek,
                periodTimeAvailable,
                periodTimeRemaining,
            } = user;
    let slotAlloted; 
            let {
              slot           
                } = req.body;
         slotAlloted = slot ? slot : 1;
            isActive = true;
            isInActive = false;
   
            startTime = Date.now();
            periodActivationCount = periodActivationCount + 1;
            console.log('start time:', startTime);
            console.log('periodActivationCount :', periodActivationCount);
            // convert NaN to number
            function getNum(val) {
                val = +val || 0
                return val;
            }
            // Convert time from milliseconds to minute
            // const convertMillisecondsToMinute = async(ms) => {
            //     return ms / 60000;
            // };

            let startTimeInMinute = await convertMillisecondsToMinute(startTime);

            // console.log('start time in ms:', Number(startTime));
          allotedSlots.push({
            position: slotAlloted
          });

            let updatedDataAfterActivation = {
           
                isActive: true,
                isInActive: false,
               presentWeek:presentWeek,
                startTime,
                periodActivationCount,
                costOfLastPeriodSession,
                durationOfLastSession,
                charges,
                totalPeriodUsedForThisWeek,
                periodBalance,
                allotedSlots,
                payForTheWeek,
                periodForTheWeek,
               startTime,
                stopTime,
                periodTimeAvailableInMin,
                periodTimeRemainingInMin,
                timeUsedToday,
                timeUsedThisWeek,
                presentWeek,
                previousWeek,
                periodTimeAvailable,
                periodTimeRemaining,
                periodActivationCount,
                ...req.body,
            };

            let userToUpdate = await User.findByIdAndUpdate(
                req.params.id,
                updatedDataAfterActivation, {
                    new: true,
                    runValidators: true,
                }
            );

            //check if user exists
            if (!userToUpdate) {
                throw createError(404, 'User does not exist');
            }


            //send user to client
            res.status(200).json({
                status: 'success',
                data: {
                    userToUpdate,
                    updatedDataAfterActivation,
                },
            });
        } else if (isDeactivated === false && periodActivationCount >= 3) {
            //find  user from database by id
            const user = await User.findById(req.params.id);
            console.log('user data:', user); //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            // Destructure the user
            let {
                isActive,
                
                startTime,
                periodTimeAvailable,
                periodTimeAvailableInMin,
                premiumPerMinute,
               
                periodActivationCount,
               
            } = user;
            startTime = Date.now();
            periodActivationCount = periodActivationCount + 1;

            console.log('start time:', startTime);
            // Convert time from milliseconds to minute
            // const convertMillisecondsToMinute = async(ms) => {
            //     return ms / 60000;
            // };

            let startTimeInMinute = await convertMillisecondsToMinute(startTime);

            console.log('start time in ms:', Number(startTime));
            console.log('start time in mins:', startTimeInMinute);
            let calculatedCost;
            calculatedCost = ((carValue * percentage) / divider);
            console.log('dirve mode calculated period rate line  495:', calculatedCost);
            let costPerMin =  calculatedCost;
            premiumPerMinute =  costPerMin;
            // premiumPerMinute = await calculatedCost;
            console.log(typeof premiumPerMinute);

            // const calculateDurationOfCurrentPeriodBalance = async(
            //     periodBalance,
            //     costPerMin
            // ) => {
            //     let minuteAvailable = 0;
            //     minuteAvailable = await (periodBalance / costPerMin);
            //     return minuteAvailable;
            // };
            // Get the available time for period
            let timeAvailableInMinute =
                await calculateDurationOfCurrentPeriodBalance(
                    periodBalance,
                    costPerMin
                );
            console.log('period time available:', timeAvailableInMinute);
            periodTimeAvailableInMin = await timeAvailableInMinute;
            periodTimeRemainingInMin = await timeAvailableInMinute;
            await user.periodTimeAvailable.push({ minutes: periodTimeAvailableInMin });
            console.log('periodTimeAvailable, line 481:', periodTimeAvailableInMin);
            await user.periodTimeRemaining.push({ minutes: periodTimeRemainingInMin });

         
            let updatedDataAfterActivation = {
                periodTimeAvailable,
                startTime,
                periodTimeAvailableInMin,
                premiumPerMinute,
                periodActivationCount
            };

            let userToUpdate = await User.findByIdAndUpdate(
                req.params.id,
                updatedDataAfterActivation, {
                    new: true,
                    runValidators: true,
                }
            );

            //check if user exists
            if (!userToUpdate) {
                throw createError(404, 'User does not exist');
            }


            // send user message
            let { email, firstName } = user;
            firstName = firstName[0].toUpperCase() + firstName.substring(1);
            console.log('To email:', email);
            let from = 'ASTRAPAY  <support@ASTRAPAY.com>';
            const lowBalanceMessage = `Dear ${firstName},

Your period balance is ASTRAPAY. Kindly take note.



Cheers!
`;

            try {
                await sendEmail({
                    from,
                    to: email,
                    subject: 'Your period balance is low on  ASTRAPAY! ',
                    text: lowBalanceMessage,
                });
                return res.status(200).json({
                    status: 'success',
                    message: 'Message was successfully sent to your email.Your period balance is low, thank you.',
                    data: {
                        userToUpdate,
                        updatedDataAfterActivation,
                    },
                });
            } catch (err) {
                next(
                    createError(
                        500,
                        'There was an error sending email and switching on period, try again later!.'
                    )
                );
            }
            
        } else if (isDeactivated === false && periodBalance >= 500  && periodActivationCount >= 1) {
            //find  user from database by id
            let user = await User.findById(req.params.id);
            console.log('user:', user);
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            // Destructure the user
            let {
                isActive,
                periodBalance,
                startTime,
                periodTimeAvailable,
                periodTimeAvailableInMin,
          
                premiumPerMinute,
              
                periodActivationCount,
               
            } = user;
            isActive = true;
            isInActive = false;
         
            startTime = Date.now();
            periodActivationCount = periodActivationCount + 1;

            console.log('start time:', startTime);
            // convert NaN to number
            function getNum(val) {
                val = +val || 0
                return val;
            }
            // Convert time from milliseconds to minute
            // const convertMillisecondsToMinute = async(ms) => {
            //     return ms / 60000;
            // };

            let startTimeInMinute = await convertMillisecondsToMinute(startTime);
   calculatedCost = ((carValue * percentage) / divider);
            console.log('calculated period rate line 747:', calculatedCost);
            let costPerMin = calculatedCost;
            premiumPerMinute =  costPerMin;
            // premiumPerMinute = await calculatedCost;
            console.log(typeof premiumPerMinute); // function to get percentage

            // const calculateDurationOfCurrentPeriodBalance = async(
            //     periodBalance,
            //     costPerMin
            // ) => {
            //     let minuteAvailable = 0;
            //     minuteAvailable = await (periodBalance / costPerMin);
            //     return minuteAvailable;
            // };
            // Get the available time for period
            let timeAvailableInMinute = await calculateDurationOfCurrentPeriodBalance(
                periodBalance,
                costPerMin
            );
            console.log('period time available:', timeAvailableInMinute);
            periodTimeAvailableInMin = await timeAvailableInMinute;

            periodTimeRemainingInMin = await timeAvailableInMinute;
            await user.periodTimeAvailable.push({ minutes: periodTimeAvailableInMin });
            console.log('periodTimeAvailable line 986:', periodTimeAvailableInMin);
            await user.periodTimeRemaining.push({ minutes: periodTimeRemainingInMin });

            let updatedDataAfterActivation = {
                periodTimeAvailable,
                isActive: true,
                isInActive: false,
                isDriving,
                startTime,
                periodTimeAvailableInMin,
                premiumPerMinute,
                periodTimeRemainingInMin,
                periodActivationCount,
            };

            let userToUpdate = await User.findByIdAndUpdate(
                req.params.id,
                updatedDataAfterActivation, {
                    new: true,
                    runValidators: true,
                }
            );

            //check if user exists
            if (!userToUpdate) {
                throw createError(404, 'User does not exist');
            }
            //send user to client
            res.status(200).json({
                status: 'success',
                data: {
                    userToUpdate,
                    updatedDataAfterActivation,
                },
            });
        } else {
            console.log('low balance or deactivated account', user);
            //send user to client
            res.status(404).json({
                status: 'fail',
                message: 'your balance is lower than the required amount or your account is deactivated.',
                data: {
                    user,
                },
            });
        };
    } catch (err) {
        if (err instanceof mongoose.CastError) {
            console.log('err :', err);
            return next(
                createError(400, 'Invalid user ID or your account is deactivated or there is a missing parameter ,though your balance is more than #500.')
            );
        }
        next(err);
    }
};

//Get a single user and stop period
exports.stopPeriod = async(req, res, next) => {

    try {
        //find  user from database by id
        let user = await User.findById(req.params.id);
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }

        let {
            isActive,
            charges,
            periodBalance,
            stopTime,
            startTime,

            premiumPerMinute,
            periodTimeAvailableInMin,

            timeRemainingInMinute,
            periodTimeRemainingInMin,
            totalPeriodUsed,
            periodActivationCount,
        } = user;
        // Convert time from milliseconds to minute
        // const convertMillisecondsToMinute = async(ms) => {
        //     return ms / 60000;
        // };

        let startTimeInMinute = await convertMillisecondsToMinute(startTime);
          let calculatedCost;
        calculatedCost = ((carValue * percentage) / divider);
        console.log('dirve mode calculated period cost line 1218:', calculatedCost);
        let costPerMin = await calculatedCost;
        premiumPerMinute = await costPerMin;
        // premiumPerMinute = await calculatedCost;
        console.log(typeof premiumPerMinute);
        // const calculateDurationOfCurrentPeriodBalance = async(
        //     periodBalance,
        //     costPerMin
        // ) => {
        //     let minuteAvailable = 0;
        //     minuteAvailable = await (periodBalance / costPerMin);
        //     return minuteAvailable;
        // };
        // Get the available time for period
        let timeAvailableInMinute = await calculateDurationOfCurrentPeriodBalance(
            periodBalance,
            costPerMin
        );
        // Calculate the amount of period charge incured after some time
        let currentTime = Date.now();
        let currentTimeInMinute = await convertMillisecondsToMinute(currentTime);
        let durationInMinute = currentTimeInMinute - startTimeInMinute;
        //  Calculate the total cost of period cover used so far
        const totalCostOfPeriod = await (durationInMinute * premiumPerMinute);

        console.log('total cost of period line 1243:', Number(totalCostOfPeriod));
        periodTimeAvailableInMin = await timeAvailableInMinute;
        console.log('periodBalance line 1249:', periodBalance);
        // startTime = 0;
        stopTime = Date.now();
        let cost = await totalCostOfPeriod;
        console.log('cost line 1254:', cost);
        user.periodBalance = await (user.periodBalance - totalCostOfPeriod);
        periodBalance = user.periodBalance;
        console.log('periodBalance line 1256:', periodBalance);
        // update the amount spent by the user so far
        user.totalExpenditure = await (user.totalExpenditure + cost);
        totalExpenditure = user.totalExpenditure;
        await charges.push({ costOfPeriod: cost, startTime: startTime, stopTime: stopTime });
        await user.usage.push({ duration: durationInMinute });
        periodTimeAvailableInMin = await timeRemainingInMinute;
        periodTimeRemainingInMin = await timeRemainingInMinute;
        await user.periodTimeAvailable.push({ minutes: periodTimeAvailableInMin });
        console.log('periodTimeAvailable, line 1270:', periodTimeAvailableInMin);
        await user.periodTimeRemaining.push({ minutes: periodTimeRemainingInMin });
        await user.walletTransactions.push({
            costOfLastPeriodSession: cost,
            transactionType: 'debit',
            category: 'period',
            amount: cost,
            createdOn: Date.now(),
        });
        await user.withdrawalTransactions.push({
            costOfLastPeriodSession: cost,
            transactionType: 'debit',
            category: 'period',
            amount: cost,
            createdOn: Date.now(),
        });
       // Data to be updated for swicthing off period
        const updatedDataAfterDeactivation = {
           periodBalance: periodBalance,
            stopTime,
            isActive: false,
            isDriving: false,
            isInActive: true,
           
            startTime,
            periodTimeAvailableInMin,
            periodTimeRemainingInMin,
            totalExpenditure: totalExpenditure,
            costOfLastPeriodSession: cost,
            walletTransactions,
            durationOfLastSession: durationInMinute,
            periodActivationCount,
            totalPeriodWithdrawals: totalPeriodWithdrawals
        };

        // update user status
        let userSwitchOffStatusForUpdate = await User.findByIdAndUpdate(
            req.params.id,
            updatedDataAfterDeactivation, {
                new: true,
                runValidators: true,
            }
        );

        //check if user exists
        if (!userSwitchOffStatusForUpdate) {
            throw createError(404, 'User does not exist');
        }

        //send user to client
        res.status(200).json({
            status: 'success',
            message: 'your period coverage is successfully turn-off,thank you for using our service.',
            data: {
                userSwitchOffStatusForUpdate,
            },
        });
    } catch (err) {
        console.log('error from turn on period:', err);
        if (err instanceof mongoose.CastError) {
            return next(createError(400, 'Invalid user ID or missing parameter'));
        }
        next(err);
    }
};

//update user period status
exports.updateUserPeriodStatus = async(req, res, next) => {
    try {
        //find  user from database by id
        let user = await User.findById(req.params.id);
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        }
        // Destructure the user
        let {
        
            isActive,
       
            periodBalance,
            startTime,
            stopTime,
            periodTimeRemaining,
            periodTimeAvailable,
            periodTimeAvailableInMin,
            periodTimeRemainingInMin,

            premiumPerMinute,
           costOfLastPeriodSession,
            walletTransactions,
            periodActivationCount,
            totalDeposit,
            totalOutwardWithdrawals,
            totalClaimWithdrawals,
            totalPeriodWithdrawals,
            totalProductWithdrawals,
         
        } = user;
        // Convert time from milliseconds to minute
        // const convertMillisecondsToMinute = async(ms) => {
        //     return ms / 60000;
        // };
        let currentTime = Date.now();
        currentTime = await convertMillisecondsToMinute(currentTime);
        console.log('current time testing from period status line 1434:', currentTime);
        let startTimeInMinute = await convertMillisecondsToMinute(startTime);
        let stopTimeInMinute = await convertMillisecondsToMinute(stopTime);

        console.log('start time in ms line 1438:', Number(startTime));
        console.log('start time in mins,line 1439 :', startTimeInMinute);

        console.log('stop time in ms:', Number(stopTime));
        console.log('stop time in mins:', stopTimeInMinute);
        // After some period of time we are to calculate
        // Calculate the amount of period charge incured after some time
        let currentTimeInMinute = currentTime;
        console.log('currentTimeInMinute from period status,line 1446:', currentTimeInMinute);
        let durationInMinute = currentTimeInMinute - startTimeInMinute;

        //  Calculate the total cost of period cover used so far
        const totalCostOfPeriod = await (durationInMinute * premiumPerMinute);

        console.log('total cost of period line 1452 :', Number(totalCostOfPeriod));

        // Calculate time used so far
        const calculateMinutesUsed = async(startTime, currentTime) => {
            let minuteUsed = 0;

            // currentTime = await convertMillisecondsToMinute(currentTime);
            startTime = await convertMillisecondsToMinute(startTime);
            minuteUsed = await (currentTime - startTime);
            return minuteUsed;
        };

        // Get the time used so far
        const timeUsedInMinute = await calculateMinutesUsed(startTime, currentTime);
        console.log('minute used so far is line 1467:', timeUsedInMinute);
        console.log('duration in minutes used so far is 1468:', durationInMinute); //  Calculate minute left
        const calculateMinuteRemainingToDeactivePeriod = async(
            periodTimeAvailableInMin,
            timeUsedInMinute
        ) => {
            const timeLeft = await (periodTimeAvailableInMin - timeUsedInMinute);
            return timeLeft;
        };
        // Convert time object to number
        // calculate the duration of the journey
        let timeDifference = await (Number(currentTime) -
            Number(startTimeInMinute));
        console.log('time difference line 1482:', timeDifference);
        // Get the remaining time on the wallet balance
        const timeRemainingInMinute =
            await calculateMinuteRemainingToDeactivePeriod(
                periodTimeAvailableInMin,
                durationInMinute
            );
        console.log('The time remaining on your wallet on line l489 is', timeRemainingInMinute);
        if (timeRemainingInMinute <= 3 && isActive === true && periodBalance > 0) {
            //find  user from database by id
            let user = await User.findById(req.params.id);
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            // Destructure the user
            let {
              
                isActive,
               
                periodBalance,
                startTime,
                stopTime,
                periodTimeRemaining,
                periodTimeAvailable,
                periodTimeAvailableInMin,
                periodTimeRemainingInMin,
                premiumPerMinute,
              
                costOfLastPeriodSession,
                periodActivationCount,
                totalDeposit,
                totalOutwardWithdrawals,
                totalClaimWithdrawals,
                totalPeriodWithdrawals,
                totalProductWithdrawals,
                withdrawalTransactions
            } = user;

            console.log('periodBalance line  1524:', periodBalance);
            // startTime = 0;
            stopTime = Date.now();

            // // Convert time from milliseconds to minute
            // const convertMillisecondsToMinute = async(ms) => {
            //     return ms / 60000;
            // };
            let currentTime = Date.now();
            currentTime = await convertMillisecondsToMinute(currentTime);
            console.log('current time testing in minute line 1534:', currentTime);
            let startTimeInMinute = await convertMillisecondsToMinute(startTime);
            let stopTimeInMinute = await convertMillisecondsToMinute(stopTime);

            console.log('start time in ms,line 1538 :', Number(startTime));
            console.log('start time in mins,line 1539:', startTimeInMinute);

            console.log('stop time in ms, line 1541:', Number(stopTime));
            console.log('stop time in mins, line 1542:', stopTimeInMinute); // After some period of time we are to calculate
            // Calculate the amount of period charge incured after some time

            let currentTimeInMinute = currentTime;
            console.log('currentTimeInMinute testing in minute line 1546:', currentTimeInMinute);
            let durationInMinute = currentTimeInMinute - startTimeInMinute;

            //  Calculate the total cost of period cover used so far
            const totalCostOfPeriod = await (durationInMinute * premiumPerMinute);

            console.log('total cost of period line 1552:', Number(totalCostOfPeriod));

            // Calculate time used so far
            const calculateMinutesUsed = async(startTime, currentTime) => {
                let minuteUsed = 0;
                startTime = await convertMillisecondsToMinute(startTime);
                minuteUsed = await (currentTime - startTime);
                return minuteUsed;
            };

            // Get the time used so far
            const timeUsedInMinute = await calculateMinutesUsed(startTime, currentTime);

            console.log('minute used so far, from line 1565 is :', timeUsedInMinute);

            console.log('duration in minutes used so far, from line 1566 is:', durationInMinute);
            // await usage.push(durationInMinute);
            let cost = await totalCostOfPeriod;
            console.log('cost 1, line 1569:', cost);
            console.log('type of cost, line 1570:', typeof cost);
            user.periodBalance = await (user.periodBalance - cost);
            periodBalance = user.periodBalance; // update the amount spent by the user so far
            console.log('wallet balance, line 1573:', periodBalance);
            user.totalExpenditure = await (user.totalExpenditure + cost);
            totalExpenditure = user.totalExpenditure;
            console.log('wallet totalExpenditure line 1577:', totalExpenditure);
            await charges.push({ costOfPeriod: cost });
            await user.usage.push({ duration: timeUsedInMinute });
            periodTimeAvailableInMin = await timeRemainingInMinute;
            periodTimeRemainingInMin = await timeRemainingInMinute;
            await user.periodTimeAvailable.push({ minutes: periodTimeAvailableInMin });
            console.log('periodTimeAvailable, line 1588:', periodTimeAvailableInMin);
            await user.periodTimeRemaining.push({ minutes: periodTimeRemainingInMin });
            await user.walletTransactions.push({
                costOfLastPeriodSession: cost,
                transactionType: 'debit',
                category: 'period',
                amount: cost,
                createdOn: Date.now(),
            });
            await user.withdrawalTransactions.push({
                costOfLastPeriodSession: cost,
                transactionType: 'debit',
                category: 'period',
                amount: cost,
                createdOn: Date.now(),
            });
            user.totalPeriodWithdrawals = user.totalPeriodWithdrawals + cost;

            totalPeriodWithdrawals = user.totalPeriodWithdrawals; // await user.walletTransactions.push({
            console.log('totalPeriodWithdrawals line 1606:', totalPeriodWithdrawals);
          

            await user.save();

            let updatedDataForDeactivation = {

                periodBalance: periodBalance,
                isActive: false,
                isInActive: true,
                isDriving: false,
                isParked: true,
                premiumPerMinute,
                charges,
                startTime,
                stopTime,
                totalExpenditure: totalExpenditure,
                costOfLastPeriodSession: cost,
                durationOfLastSession: timeUsedInMinute,
                totalPeriodWithdrawals: totalPeriodWithdrawals
            };
            user = await User.findByIdAndUpdate(
                req.params.id,
                updatedDataForDeactivation, {
                    new: true,
                    runValidators: true,
                }
            );

            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            //send user to client
            res.status(200).json({
                status: 'success',
                message: 'your period coverage is off, or because your account balance was low,thank you for using our service.',
                walletTransactions,
                data: {
                    user,
                    updatedDataForDeactivation,
                },
            });
        } else if (timeRemainingInMinute >= 3 && isActive === true) {
            //find  user from database by id
            let user = await User.findById(req.params.id);
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            // Destructure the user
            let {
                isDriving,
                isActive,
                isParked,
                periodBalance,
                startTime,
                stopTime,
                periodTimeRemaining,
                periodTimeAvailable,
                periodTimeAvailableInMin,
                periodTimeRemainingInMin,

                premiumPerMinute,
                usage,
                charges,
                totalExpenditure,
                costOfLastPeriodSession,
            } = user;
            console.log('usage times line 1743 :', usage);

            // Convert time from milliseconds to minute
            // const convertMillisecondsToMinute = async(ms) => {
            //     return ms / 60000;
            // };
            let currentTime = Date.now();
            currentTime = await convertMillisecondsToMinute(currentTime);
            console.log('current time testing, line 1751:', currentTime);
            let startTimeInMinute = await convertMillisecondsToMinute(startTime);
            let stopTimeInMinute = await convertMillisecondsToMinute(stopTime);

            console.log('start time in ms line 1755:', Number(startTime));
            console.log('start time in mins line 1756:', startTimeInMinute);

            console.log('stop time in ms line 1758:', Number(stopTime));
            console.log('stop time in mins line 1759:', stopTimeInMinute);
            // After some period of time we are to calculate
            // Calculate the amount of period charge incured after some time

            let currentTimeInMinute = currentTime;
            let durationInMinute = currentTimeInMinute - startTimeInMinute;

            //  Calculate the total cost of period cover used so far
            const totalCostOfPeriod = await (durationInMinute * premiumPerMinute);
            console.log('total cost of period line 1769:', Number(totalCostOfPeriod));

            // Calculate time used so far
            const calculateMinutesUsed = async(startTime, currentTime) => {
                let minuteUsed = 0;
                startTime = await convertMillisecondsToMinute(startTime);
                minuteUsed = await (currentTime - startTime);
                return minuteUsed;
            };
            // Get the time used so far
            const timeUsedInMinute = await calculateMinutesUsed(startTime, currentTime);
            console.log('minute used so far is line 1782:', timeUsedInMinute);
            console.log('duration in minutes used so far is line 1783:', durationInMinute);

            let cost = await totalCostOfPeriod;
            user.periodTimeAvailableInMin = await timeRemainingInMinute;
            user.periodTimeRemainingInMin = await timeRemainingInMinute;
            await user.periodTimeAvailable.push({ minutes: periodTimeAvailableInMin });
            console.log('periodTimeAvailable line 1807:', periodTimeAvailableInMin);
            await user.periodTimeRemaining.push({ minutes: periodTimeRemainingInMin });
            await user.save();
            //send user to client
            res.status(200).json({
                status: 'success',
                data: {
                    user
                },
            }); 
         
        } else if (isActive === false && periodBalance > 0 || isActive === false && periodBalance === 0 || isActive === true && periodBalance === 0) {
            console.log('running the conditional code from line 1849.');
            //find  user from database by id
            let user = await User.findById(req.params.id);
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }

            //send user to client
            res.status(200).json({
                status: 'success',
                data: {
                    user,
                },
            });
            // return updatedDataForDeactivation;
        }

    } catch (err) {
        if (err instanceof mongoose.CastError) {
            return next(createError(400, 'Invalid user ID'));
        }
        next(err);
    }
};

//update users period status
exports.updateUsersPeriodStatus = async(req, res, next) => {
    try {
        //find  users from database by id
        let user = await User.find({role:'user'});
        //check if user exists
        if (!user) {
            throw createError(404, 'User does not exist');
        };
        console.log('users in database line 1896:', user);
        let index;
        for (let i = 0; i < user.length; i++) {
            console.log('user index in database line 1898:', i);
        index =i;
        // Destructure the user
        let {
         
            isActive,
            isParked,
            periodBalance,
            startTime,
            stopTime,
            periodTimeRemaining,
            periodTimeAvailable,
            periodTimeAvailableInMin,
            periodTimeRemainingInMin,

            premiumPerMinute,
            usage,
            charges,
            totalExpenditure,
            costOfLastPeriodSession,
            walletTransactions,
            periodActivationCount,
            totalDeposit,
            totalOutwardWithdrawals,
            totalClaimWithdrawals,
            totalPeriodWithdrawals,
            totalProductWithdrawals,
            withdrawalTransactions,
            _id,
        } = user[index];
        console.log('userId line 1931:', user.length);
        let id = _id;
        console.log('userId line 1933:', id);
        // Convert time from milliseconds to minute
        // const convertMillisecondsToMinute = async(ms) => {
        //     return ms / 60000;
        // };
        let currentTime = Date.now();
        console.log('start time in ms line 1939:', startTime);
        if(startTime === undefined){startTime = currentTime;};
        console.log('start time in ms line 1941:', Number(startTime));
        let currentTimeInMinute = await convertMillisecondsToMinute(currentTime);
        console.log('current time in minute testing from period status line 1943:', currentTimeInMinute);
     
        let startTimeInMinute = await convertMillisecondsToMinute(startTime);
  
        console.log('start time in mins,line 1947 :', startTimeInMinute);
        let stopTimeInMinute;
       if(stopTime != undefined) {
        stopTimeInMinute = await convertMillisecondsToMinute(stopTime);
        console.log('stop time in ms, line 1951:', Number(stopTime));
        console.log('stop time in mins,line 1952:', stopTimeInMinute);
       } // After some period of time we 
        // Calculate the amount of period charge incured 
        
        console.log('currentTimeInMinute from period status,line 1956:', currentTimeInMinute);
        let durationInMinute = currentTimeInMinute - startTimeInMinute;
        console.log('current period premiumPerMinute,line 1958:', premiumPerMinute);
        //  Calculate the total cost of period cover used so far
        let totalCostOfPeriod;
        if(premiumPerMinute != undefined){
            totalCostOfPeriod =  (durationInMinute * premiumPerMinute);
            console.log('total cost of period line 1963 :', Number(totalCostOfPeriod));
           }
       
        // Calculate time used so far
        const calculateMinutesUsed = async(startTimeInMinute, currentTimeInMinute) => {
            let minuteUsed = 0;
          minuteUsed = await (currentTimeInMinute - startTimeInMinute);
            return minuteUsed;
        };

        // Get the time used so far
        const timeUsedInMinute = await calculateMinutesUsed(startTimeInMinute, currentTimeInMinute);
        console.log('minute used so far is line 1977:', timeUsedInMinute);
        console.log('duration in minutes used so far is 1978:', durationInMinute); //  Calculate minute left
        console.log('periodTimeAvailableInMin is line 1979:', periodTimeAvailableInMin);
        const calculateMinuteRemainingToDeactivePeriod = async(
            periodTimeAvailableInMin,
            timeUsedInMinute
        ) => {
            const timeLeft = await (periodTimeAvailableInMin - timeUsedInMinute);
            return timeLeft;
        }; 
               
        // Convert time object to number
        // calculate the duration of the journey
        let timeDifference = await (Number(currentTimeInMinute) -
            Number(startTimeInMinute));
        console.log('time difference line 1992:', timeDifference);
        // Get the remaining time on the wallet balance
        let timeRemainingInMinute;
        if(periodTimeAvailableInMin != undefined){
            timeRemainingInMinute = await calculateMinuteRemainingToDeactivePeriod(
                periodTimeAvailableInMin,
                durationInMinute
            );
        console.log('The time remaining on your wallet on line 2000 is', timeRemainingInMinute);
       
        }
        console.log('The time remaining on your wallet on line 2001 is', timeRemainingInMinute);
          if (timeRemainingInMinute != undefined && timeRemainingInMinute <= 3 && isActive === true && periodBalance > 0) {
            //find  user from database by id
            let user = await User.find({_id: id});
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            console.log('The user data on line 2009 is', user);
            // Destructure the user
            let {
            
                isActive,
              
                periodBalance,
                startTime,
                stopTime,
                periodTimeRemaining,
                periodTimeAvailable,
                periodTimeAvailableInMin,
                periodTimeRemainingInMin,
                premiumPerMinute,
                usage,
                charges,
                totalExpenditure,
                costOfLastPeriodSession,
                periodActivationCount,
                totalDeposit,
                totalOutwardWithdrawals,
                totalClaimWithdrawals,
                totalPeriodWithdrawals,
                totalProductWithdrawals,
                withdrawalTransactions
            } = user;

            console.log('periodBalance line  2030:', periodBalance);
            // startTime = 0;
            stopTime = Date.now();

            // Convert time from milliseconds to minute
            // const convertMillisecondsToMinute = async(ms) => {
            //     return ms / 60000;
            // };
            let currentTime = Date.now();
            let currentTimeInMinute = await convertMillisecondsToMinute(currentTime);
            console.log('current time testing in minute line 2040:', currentTimeInMinute);
            let startTimeInMinute = await convertMillisecondsToMinute(startTime);
            let stopTimeInMinute = await convertMillisecondsToMinute(stopTime);

            console.log('start time in ms,line 2044 :', Number(startTime));
            console.log('start time in mins,line 2045:', startTimeInMinute);

            console.log('stop time in ms, line 2047:', Number(stopTime));
            console.log('stop time in mins, line 2048:', stopTimeInMinute); 
            // After some period of time we are to calculate
            // Calculate the amount of period charge incured after some time
  
            console.log('currentTimeInMinute testing in minute line 2052:', currentTimeInMinute);
            let durationInMinute = currentTimeInMinute - startTimeInMinute;

            //  Calculate the total cost of period cover used so far
            const totalCostOfPeriod = await (durationInMinute * premiumPerMinute);

            console.log('total cost of period line 2058:', Number(totalCostOfPeriod));

            // Calculate time used so far
            const calculateMinutesUsed = async(startTimeInMinute, currentTimeInMinute) => {
                let minuteUsed = 0;
               minuteUsed = await (currentTimeInMinute - startTimeInMinute);
                return minuteUsed;
            };

            // Get the time used so far
            const timeUsedInMinute = await calculateMinutesUsed(startTimeInMinute, currentTimeInMinute);

            console.log('minute used so far, from line 2071 is :', timeUsedInMinute);

            console.log('duration in minutes used so far, from line 2073 is:', durationInMinute);
            // await usage.push(durationInMinute);
            let cost = await totalCostOfPeriod;
            console.log('cost 1, line 2076:', cost);
            console.log('type of cost, line 2077:', typeof cost);
            user.periodBalance = await (user.periodBalance - cost);
            periodBalance = user.periodBalance; // update the amount spent by the user so far
            console.log('wallet balance, line 2080:', periodBalance);
            user.totalExpenditure = await (user.totalExpenditure + cost);
            totalExpenditure = user.totalExpenditure;
           
            console.log('wallet totalExpenditure line 2084:', totalExpenditure);
            await charges.push({ costOfPeriod: cost });
            await user.usage.push({ duration: timeUsedInMinute });
            periodTimeAvailableInMin = await timeRemainingInMinute;
            periodTimeRemainingInMin = await timeRemainingInMinute;
            await user.periodTimeAvailable.push({ minutes: periodTimeAvailableInMin });
        
            console.log('periodTimeAvailable, line 2091:', periodTimeAvailableInMin);
            await user.periodTimeRemaining.push({ minutes: periodTimeRemainingInMin });
            await user.walletTransactions.push({
                costOfLastPeriodSession: cost,
                transactionType: 'debit',
                category: 'period',
                amount: cost,
                createdOn: Date.now(),
            });
            await user.withdrawalTransactions.push({
                costOfLastPeriodSession: cost,
                transactionType: 'debit',
                category: 'period',
                amount: cost,
                createdOn: Date.now(),
            });
            totalPeriodWithdrawals = user.totalPeriodWithdrawals + cost;

            // totalPeriodWithdrawals = user.totalPeriodWithdrawals; 
            // await user.walletTransactions.push({
            console.log('totalPeriodWithdrawals line 2110:', totalPeriodWithdrawals);
          await user.save();

            let updatedDataForDeactivation = {

                periodBalance: periodBalance,
                isActive: false,
                isInActive: true,
                isDriving: false,
                isParked: true,
                premiumPerMinute,
                charges,
                startTime,
                stopTime,
                totalExpenditure: totalExpenditure,
                costOfLastPeriodSession: cost,
                durationOfLastSession: timeUsedInMinute,
                totalPeriodWithdrawals: totalPeriodWithdrawals
            };
            user = await User.findByIdAndUpdate(
                req.params.id,
                updatedDataForDeactivation, {
                    new: true,
                    runValidators: true,
                }
            );

            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            //send user to client
            res.status(200).json({
                status: 'success',
                message: 'your period coverage is off, or because your account balance was low,thank you for using our service.',
                walletTransactions,
                data: {
                    user,
                    updatedDataForDeactivation,
                },
            });
        } else if (timeRemainingInMinute != undefined && timeRemainingInMinute >= 3 && isActive === true) {
            //find  user from database by id
            let user = await User.findById({_id:id});
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }
            // Destructure the user
            let {
                isDriving,
                isActive,
                isParked,
                periodBalance,
                startTime,
                stopTime,
                periodTimeRemaining,
                periodTimeAvailable,
                periodTimeAvailableInMin,
                periodTimeRemainingInMin,

                premiumPerMinute,
                usage,
                charges,
                totalExpenditure,
                costOfLastPeriodSession,
            } = user;
            console.log('usage times line 2177 :', usage);

            // Convert time from milliseconds to minute
            // const convertMillisecondsToMinute = async(ms) => {
            //     return ms / 60000;
            // };
            let currentTime = Date.now();
            let currentTimeInMinute  = await convertMillisecondsToMinute(currentTime);
            console.log('current time testing, line 2185:', currentTimeInMinute);
            let startTimeInMinute = await convertMillisecondsToMinute(startTime);
            let stopTimeInMinute = await convertMillisecondsToMinute(stopTime);

            console.log('start time in ms line 2189:', Number(startTime));
            console.log('start time in mins line 2190:', startTimeInMinute);

            console.log('stop time in ms line 2192:', Number(stopTime));
            console.log('stop time in mins line 2193:', stopTimeInMinute);
            // After some period of time we are to calculate
            // Calculate the amount of period charge incured after some time

            let durationInMinute = currentTimeInMinute - startTimeInMinute;

            //  Calculate the total cost of period cover used so far
            const totalCostOfPeriod = await (durationInMinute * premiumPerMinute);
            console.log('total cost of period line 2202:', Number(totalCostOfPeriod));

            // Calculate time used so far
            const calculateMinutesUsed = async(startTimeInMinute, currentTimeInMinute) => {
                let minuteUsed = 0;
                // startTimeInMinute = await convertMillisecondsToMinute(startTimeInMinute);
                minuteUsed = await (currentTimeInMinute - startTimeInMinute);
                return minuteUsed;
            };
            // Get the time used so far
            const timeUsedInMinute = await calculateMinutesUsed(startTimeInMinute, currentTimeInMinute);
            console.log('minute used so far is line 2213:', timeUsedInMinute);
            console.log('duration in minutes used so far is line 2214:', durationInMinute);

            let cost = await totalCostOfPeriod;
            periodTimeAvailableInMin = await timeRemainingInMinute;
            periodTimeRemainingInMin = await timeRemainingInMinute;
            await user.periodTimeAvailable.push({ minutes: periodTimeAvailableInMin });
         
            console.log('periodTimeAvailable line 2221:', periodTimeAvailableInMin);
            await user.periodTimeRemaining.push({ minutes: periodTimeRemainingInMin });
           
            await user.save();

            //send user to client
            res.status(200).json({
                status: 'success',
                data: {
                    user
                },
            }); // return updatedDataForDeactivation;
        } else if (timeRemainingInMinute === undefined && isActive === false && periodBalance > 0 || timeRemainingInMinute === undefined &&  isActive === false && periodBalance === 0 || timeRemainingInMinute === undefined && isActive === true && periodBalance === 0 || timeRemainingInMinute != undefined && isActive === false && periodBalance > 0 || timeRemainingInMinute != undefined &&  isActive === false && periodBalance === 0 || timeRemainingInMinute != undefined && isActive === true && periodBalance === 0) {
            console.log('running the conditional code from line 2234.');
            console.log('user id from line 2235.', id);
            //find  user from database by id
            let user = await User.find({_id:id});
            //check if user exists
            if (!user) {
                throw createError(404, 'User does not exist');
            }

            //send user to client
            res.status(200).json({
                status: 'success',
                data: {
                    user,
                },
            });
            // return updatedDataForDeactivation;
        }
        };
    } catch (err) {
        if (err instanceof mongoose.CastError) {
            return next(createError(400, 'Invalid user ID'));
        }
        next(err);
    }
};
