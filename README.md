1.The entry methods are:
	transformTechLog(file, callback)
	transformTfd(file, callback)

2.Call example for TechLog (same for Tfd):

	transformTechLog(file, function (success, failure) {
           if (success) {
             //process data
           }
           else {
            //manage failure
           }
         });

