import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../elements/BaguioPinelodgelogo.png';
import logoCursor from '../../elements/logoCursor.png';
import { auth, db } from '../firebase';
import ProfileMenu from './ProfileMenu';
import { Box, Button, Typography, Card, CardContent, Container, Grid } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import SavingsIcon from '@mui/icons-material/Savings';

export default function GetStarted() {
  const [userEmail, setUserEmail] = React.useState('');
  const [step, setStep] = React.useState(1);
  const paypal = React.useRef();
  const navigate = useNavigate();

  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  }, []);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserEmail(user.email);
      else setUserEmail('');
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
                  amount: { currency_code: 'PHP', value: 3000.0 },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            alert('Payment Successful! Welcome to PineLodge.');
            const user = auth.currentUser;
            if (user) {
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, { isNewUser: false });
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
    <Box sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Navbar */}
      <Box
        component="nav"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 4,
          py: 2,
          backgroundColor: '#1C1C1C',
          borderRadius: '24px',
          mx: 3,
          mt: 2,
        }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Link to="" style={{ textDecoration: 'none' }}>
            <img
              src={logo}
              alt="Baguio PineLodge Logo"
              style={{
                width: 48,
                height: 48,
                cursor: `url(${logoCursor}) 0 0, pointer`,
              }}
            />
          </Link>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'lighter',
                fontSize: 26,
                mb: -1,
                color: '#f9f9f9',
                fontFamily: "'Kingred Serif', serif",
              }}
            >
              BAGUIO
            </Typography>
            <Typography
              variant="caption"
              sx={{
                letterSpacing: 3,
                fontSize: 12,
                color: '#f9f9f9',
                fontFamily: "'Questrial', sans-serif",
              }}>
              PINELODGE
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button
            sx={{
              color: '#f9f9f9',
              textTransform: 'none',
              fontSize: '14px',
              '&:hover': { color: '#DE7001' },
            }}>
            Why Us
          </Button>
          <Button
            sx={{
              color: '#f9f9f9',
              textTransform: 'none',
              fontSize: '14px',
              '&:hover': { color: '#DE7001' },
            }}>
            About Us
          </Button>
          <Button
            sx={{
              color: '#f9f9f9',
              textTransform: 'none',
              fontSize: '14px',
              '&:hover': { color: '#DE7001' },
            }}>
            Portfolio
          </Button>
          {userEmail && <ProfileMenu userEmail={userEmail} />}
        </Box>
      </Box>

      {step === 1 && (
        <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: '#1C1C1C',
                mb: 3,
                fontSize: { xs: '36px', md: '56px' },
                lineHeight: 1.2,
              }}
            >
              Host your space
              <br />
              Earn easily <TrendingUpIcon sx={{ fontSize: 56, color: '#1C1C1C', ml: 1 }} />
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#1C1C1C',
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
                fontSize: '16px',
                lineHeight: 1.6,
              }}
            >
              Unlock your property's potential with our proven hosting platform.
              <br />
              From listing to income, we make hosting simple.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<TrendingUpIcon />}
              sx={{
                backgroundColor: '#DE7001',
                color: '#1C1C1C',
                px: 5,
                py: 1.5,
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(222, 112, 1, 0.3)',
                '&:hover': {
                  backgroundColor: '#DE7001',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(222, 112, 1, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Book a call
            </Button>
          </Box>

          {/* Stats & Services Section */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {/* Services Card */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: 4,
                  p: 3,
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: '#1C1C1C', mb: 3 }}
                >
                  Services
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {['Property Listing', 'Guest Management', 'Marketing', 'Analytics', 'Support 24/7'].map((service, index) => (
                    <Box
                      key={index}
                      sx={{
                        backgroundColor: '#1C1C1C',
                        color: '#f9f9f9',
                        px: 2,
                        py: 1,
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {service}
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>

            {/* Stats Card 1 */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  backgroundColor: '#1C1C1C',
                  color: '#f9f9f9',
                  borderRadius: 4,
                  p: 3,
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                <Typography
                  variant="h2"
                  sx={{ fontWeight: 700, color: '#DE7001', mb: 1 }}
                >
                  500+
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '14px' }}>
                  Active hosts have listed properties
                  <br />
                  with us.
                </Typography>
              </Card>
            </Grid>

            {/* Stats Card 2 */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: 4,
                  p: 3,
                  height: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Typography
                  variant="h2"
                  sx={{ fontWeight: 700, color: '#70873F', mb: 1 }}
                >
                  ₱3K
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '14px', color: '#1C1C1C' }}>
                  Yearly subscription for unlimited
                  <br />
                  listing potential.
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Why Choose Us Section */}
          <Box
            sx={{
              backgroundColor: '#1C1C1C',
              borderRadius: 4,
              p: 6,
              mb: 8,
            }}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: '#f9f9f9',
                    mb: 2,
                    fontSize: { xs: '24px', md: '32px' },
                  }}
                >
                  Why our clients choose us as partners
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  {[
                    {
                      icon: <SpeedIcon sx={{ fontSize: 40, color: '#DE7001' }} />,
                      title: 'Fast & Easy Setup',
                      description: 'Get your property listed in minutes with our streamlined process and intuitive interface.',
                    },
                    {
                      icon: <VisibilityIcon sx={{ fontSize: 40, color: '#DE7001' }} />,
                      title: 'Maximum Visibility',
                      description: 'Reach thousands of travelers looking for authentic Baguio experiences and accommodations.',
                    },
                    {
                      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#DE7001' }} />,
                      title: 'Growing Platform',
                      description: 'Join a rapidly expanding community of successful hosts earning consistent income.',
                    },
                    {
                      icon: <SavingsIcon sx={{ fontSize: 40, color: '#DE7001' }} />,
                      title: 'Affordable Pricing',
                      description: 'Only ₱3,000/year for unlimited listings and premium features. No hidden fees.',
                    },
                  ].map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box>
                        <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#f9f9f9',
                            mb: 1,
                            fontSize: '18px',
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: '#f9f9f9', fontSize: '14px', lineHeight: 1.6 }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* CTA Section */}
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: 4,
              p: 6,
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#1C1C1C',
                mb: 2,
                fontSize: { xs: '24px', md: '32px' },
              }}
            >
              Ready to start hosting?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#1C1C1C',
                mb: 3,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Join hundreds of successful hosts who trust PineLodge to manage their properties
              and maximize their earnings.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                backgroundColor: '#70873F',
                color: '#f9f9f9',
                px: 5,
                py: 1.5,
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#30410D',
                },
              }}
            >
              Get Started Today
            </Button>
          </Box>
        </Container>
      )}

      {step === 2 && (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
          <Card
            sx={{
              borderRadius: 4,
              p: 5,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
            }}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#1C1C1C',
                    mb: 2,
                    fontSize: '28px',
                  }}
                >
                  Activate Your Host Account
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#1C1C1C',
                    mb: 3,
                    lineHeight: 1.6,
                  }}
                >
                  A yearly ₱3,000 subscription gives you access to host tools,
                  guest visibility, and exclusive PineLodge support.
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: 3,
                  p: 3,
                  mb: 3,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ color: '#1C1C1C', fontWeight: 500 }}>
                        Annual Subscription
                      </Typography>
                      <Typography sx={{ color: '#70873F', fontWeight: 700, fontSize: '20px' }}>
                        ₱3,000
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#1C1C1C', display: 'block', mt: 1 }}>
                      ✓ Unlimited property listings
                      <br />
                      ✓ Premium visibility
                      <br />
                      ✓ 24/7 host support
                      <br />
                      ✓ Analytics dashboard
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <div ref={paypal}></div>

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: '#1C1C1C',
                  mt: 3,
                }}
              >
                Secure payment powered by PayPal
              </Typography>
            </CardContent>
          </Card>
        </Container>
      )}

      {step === 3 && (
        <Box sx={{ textAlign: 'center', mt: 12 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#30410D',
              mb: 2,
            }}
          >
            Welcome to the PineLodge Host Family!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Your host account is now active. Begin listing your cozy Baguio
            stays and start welcoming guests.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#DE7001',
              color: '#fff',
              px: 4,
              py: 1.2,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#DE7001' },
            }}
            onClick={handleProceed}
          >
            Proceed to Listing
          </Button>
        </Box>
      )}
    </Box>
  );
}
