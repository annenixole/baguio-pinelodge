import * as React from 'react';
import { Link,useNavigate } from 'react-router-dom';
import logo from '../../elements/BaguioPinelodgelogo.png';
import logoCursor from '../../elements/logoCursor.png';
import { auth, db } from '../firebase';
import ProfileMenu from './ProfileMenu';
import { Box, Button,Typography } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';


export default function GetStarted() {
  const [userEmail, setUserEmail] = React.useState('');
  const [step, setStep] = React.useState(1);
  const paypal = React.useRef();
  const navigate = useNavigate();


  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail('');
      }
    });
    return () => unsubscribe();
  }, []);


  React.useEffect(() => {
    if (step === 2 && paypal.current && !paypal.current.hasChildNodes()) {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'subscribe',
            height: 45,
          },
          createOrder: (data, actions) => {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  description: 'Baguio Pinelodge Host Subscription',
                  amount: {
                    currency_code: 'PHP',
                    value: 3000.00,
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            console.log(order);
            alert('Payment Successful!');

            const user = auth.currentUser;
            if(user){
              const userRef = doc(db, "users", user.uid);
              await updateDoc(userRef, { isNewUser:false});
            }
            setStep(3);
          },
          onError: (err) => {
            console.log(err);
            alert('Payment Failed! Please try again.');
          },
        })
        .render(paypal.current);
    }
  }, [step]);

  const handleGetStarted = () => setStep(2);
  const handleProceed = () => navigate('/hostPage/HomeHost');

  return (
    <div className="GetStarted">
      <Box
        component="nav"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px auto',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fff',
        }}
      >
        {/*Logo and name */}
        <Box display="flex" alignItems="center" gap={1}>
          <Link to="" style={{ textDecoration: "none" }}>
            <img
              src={logo}
              alt="Baguio PineLodge Logo"
              style={{ width: 54, height: 54, cursor: `url(${logoCursor}) 0 0, pointer` }}
            />
          </Link>
          <Box>
            <Typography variant="h6"
              sx={{
                fontWeight: 'lighter',
                fontSize: 28,
                mb: -1,
                color: '#30410D;',
                fontFamily: "'Kingred Serif', serif",
                cursor: `url(${logoCursor}) 0 0, pointer`
              }}>
              BAGUIO
            </Typography>

            <Typography variant="caption"
              sx={{
                letterSpacing: 3,
                fontSize: 13,
                color: '#30410D;',
                fontFamily: "'Questrial', sans-serif",
                cursor: `url(${logoCursor}) 0 0, pointer`
              }}>
              PINELODGE
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', paddingRight: 5 }}>
          {userEmail && <ProfileMenu userEmail={userEmail} />}
        </Box>
      </Box>


      {step === 1 && (
        <div className="GetStarted-Content" style={{ textAlign: 'center', marginTop: '60px' }}>
          <Button variant="contained" size="large" onClick={handleGetStarted}>
            Get Started
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="Payment-Content" style={{ textAlign: 'center', marginTop: '40px' }}>
          <div
            ref={paypal}
            style={{
              width: '250px',
              margin: '0 auto',
            }}
          ></div>
        </div>
      )}

      {step === 3 && (
        <div className="Completed-Content" style={{ textAlign: 'center', marginTop: '60px' }}>
          <h2>You're all set! Start listing your property now.</h2>
          <Button variant="contained" size="large" sx={{ mt: 2 }} onClick={handleProceed}>
            Proceed to Listing
          </Button>
        </div>
      )}
    </div>
  );
}
