import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Slick.css'; // Import CSS tùy chỉnh sau slick styles
import CarouselItem from "./CarouselItem";
import Slider from "react-slick";
import { topEvents } from "./topEvent";
import { Box, useTheme, useMediaQuery } from '@mui/material';
import './Slick.css';

const MultiItemCarousel = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const settings = {
        dots: true,
        infinite: true,
        speed: 700,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: true, // Sử dụng các mũi tên mặc định, sẽ được tùy chỉnh bằng CSS
        fade: true,
        appendDots: (dots: any) => (
            <Box
                component="ul"
                sx={{
                    margin: '0px',
                    padding: '0px',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: theme.spacing(1),
                }}
            >
                {dots}
            </Box>
        ),
        customPaging: () => (
            <Box
                sx={{
                    width: isMobile ? '10px' : '12px',
                    height: isMobile ? '10px' : '12px',
                    borderRadius: '50%',
                    background: '#ccc',
                    '&.slick-active': {
                        background: theme.palette.primary.main,
                    },
                }}
            />
        ),
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', height: { xs: '200px', sm: '400px', md: '500px' }, mb: 4 }}>
            <Slider {...settings}>
                {topEvents.map((item, index) => (
                    <CarouselItem key={index} image={item.image} title={item.title} description={item.description} link={item.link} />
                ))}
            </Slider>
        </Box>
    );
};

export default MultiItemCarousel;