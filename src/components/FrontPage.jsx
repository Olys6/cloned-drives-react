import { Typography, Box, Link } from '@mui/material';
import React from 'react';

const FrontPage = () => {
	return (
		<Box>
			<Typography
				variant='h3'
				sx={{ fontWeight: 'bold' }}>
				WELCOME TO CLONEDDRIVES.CLUB!
			</Typography>

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: '1.5rem',
					marginTop: 10,
				}}>
				<Link
					href='/home'
					className='carlist fontPageItem'
					sx={{
						borderRadius: 15,
						textDecoration: 'none',
					}}>
					<Typography
						variant='h2'
						sx={{
							color: 'white',
							fontWeight: 'bold',
							textShadow:
								'1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black',
						}}>
						CARLIST
					</Typography>
				</Link>
				<Link
					href='/tracks'
					className='tracklist fontPageItem'
					sx={{
						borderRadius: 15,
						textDecoration: 'none',
					}}>
					<Typography
						variant='h2'
						sx={{
							color: 'white',
							fontWeight: 'bold',
							textShadow:
								'1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black',
						}}>
						TRACKLIST
					</Typography>
				</Link>
				<Link
					href='/packs'
					className='packlist fontPageItem'
					sx={{
						borderRadius: 15,
						textDecoration: 'none',
					}}>
					<Typography
						variant='h2'
						sx={{
							color: 'white',
							fontWeight: 'bold',
							textShadow:
								'1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black',
						}}>
						PACKLIST
					</Typography>
				</Link>
				<Link
					href='/bm-cars'
					className='bmcarlist fontPageItem'
					sx={{
						borderRadius: 15,
						textDecoration: 'none',
					}}>
					<Typography
						variant='h2'
						sx={{
							color: 'white',
							fontWeight: 'bold',
							textShadow:
								'1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black',
						}}>
						BLACK MARKET
					</Typography>
				</Link>
				<Link
					href='/pack-simulator'
					className='packsim fontPageItem'
					sx={{
						borderRadius: 15,
						textDecoration: 'none',
					}}>
					<Typography
						variant='h2'
						sx={{
							color: 'white',
							fontWeight: 'bold',
							textShadow:
								'1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black',
						}}>
						PACK SIM
					</Typography>
				</Link>
				<Link
					href='/race-simulator'
					className='racesim fontPageItem'
					sx={{
						borderRadius: 15,
						textDecoration: 'none',
					}}>
					<Typography
						variant='h2'
						sx={{
							color: 'white',
							fontWeight: 'bold',
							textShadow:
								'1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black',
						}}>
						RACE SIM
					</Typography>
				</Link>
				<Link
					href='/clicker'
					className='clicker fontPageItem'
					sx={{
						borderRadius: 15,
						textDecoration: 'none',
					}}>
					<Typography
						variant='h2'
						sx={{
							color: 'white',
							fontWeight: 'bold',
							textShadow:
								'1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black',
						}}>
						CLICKER
					</Typography>
				</Link>
			</Box>
		</Box>
	);
};

export default FrontPage;
