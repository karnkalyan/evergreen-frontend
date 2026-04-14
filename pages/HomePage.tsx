import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/products/ProductCard';
import { MOCK_BLOG_POSTS, HOME_SECTIONS } from '../data/mockData';
import Button from '../components/shared/Button';
import { ICONS } from '../constants';
import ProductCarousel from '../components/home/ProductCarousel';
import TestimonialCard from '../components/home/TestimonialCard';
import { useMediaQuery } from '../hooks/useMediaQuery';
import PromotionalGrid from '../components/home/PromotionalGrid';
import BlogCard from '../components/blog/BlogCard';
import { useApp } from '../hooks/useApp';
import { HomepageSection, TrustBadgeItem, Product, Category, Brand } from '../types';
import FeatureCards from '../components/home/FeatureCards';
import ImageGallery from '../components/home/ImageGallery';
import PromoBanner from '../components/home/PromoBanner';
import NewsletterSignup from '../components/home/NewsletterSignup';
import FaqSection from '../components/home/FaqSection';
import VideoSection from '../components/home/VideoSection';
import CallToActionSection from '../components/home/CallToActionSection';
import KeyMetricsSection from '../components/home/KeyMetricsSection';
import PromoCards from '../components/home/PromoCards';
import MedicineRequestForm from '../components/home/MedicineRequestForm';
import { publicProductService } from '../lib/productService';
import { publicCategoryService } from '../lib/categoryService';
import { publicBrandService } from '../lib/brandService';
import { publicAboutUsService, AboutUsData } from '../lib/aboutUsService'; // Add this import
import { websiteSettingsService } from '../lib/websiteSettingsService';
import {
    Shield,
    Truck,
    CreditCard,
    Clock,
    Heart,
    Star,
    Award,
    CheckCircle,
    Lock,
    Users,
    ThumbsUp
} from 'lucide-react';

const SectionTitle: React.FC<{ title: string; link?: string; linkText?: string; }> = ({ title, link, linkText = 'View All' }) => (
    <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-poppins font-bold text-slate-900 relative pb-2">
            {title}
            <span className="absolute bottom-0 left-0 w-20 h-1 bg-primary-gradient rounded-full"></span>
        </h2>
        {link && (
            <Link to={link} className="font-semibold text-primaryEnd hover:underline flex-shrink-0 ml-4">
                {linkText}
            </Link>
        )}
    </div>
);

const LUCIDE_ICONS: { [key: string]: React.ComponentType<any> } = {
    shield: Shield,
    truck: Truck,
    creditCard: CreditCard,
    clock: Clock,
    heart: Heart,
    star: Star,
    award: Award,
    checkCircle: CheckCircle,
    lock: Lock,
    users: Users,
    thumbsUp: ThumbsUp
};

const TrustBadgesSection: FC<{ section: HomepageSection }> = ({ section }) => {
    const trustFeatures = section.config?.trustBadgeItems || [];
    if (!trustFeatures || trustFeatures.length === 0) return null;

    return (
        <section className="py-8 md:py-10 md:bg-white">
            <div className="container mx-auto px-4">
                <div className={`grid grid-cols-2 md:grid-cols-${trustFeatures.length} gap-3 md:gap-8`}>
                    {trustFeatures.map((feature, index) => {
                        const IconComponent = LUCIDE_ICONS[feature.icon];
                        return (
                            <div
                                key={feature.id}
                                className="bg-white p-4 rounded-xl shadow-soft-md flex flex-col items-center justify-center text-center 
                                           md:bg-transparent md:p-0 md:shadow-none"
                                data-aos-delay={index * 100}
                            >
                                <div className={`${feature.color} mb-2 flex-shrink-0`}>
                                    {IconComponent ? (
                                        <IconComponent className="h-7 w-7 md:h-9 md:w-9" />
                                    ) : (
                                        <div className="h-7 w-7 md:h-9 md:w-9 bg-slate-200 rounded-full flex items-center justify-center">
                                            <span className="text-xs text-slate-500">?</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xs font-semibold text-slate-700 md:text-base">{feature.title}</h3>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const BrandCarouselSection: FC<{ section: HomepageSection; brands: Brand[] }> = ({ section, brands }) => {
    const brandIds = section.config?.brandIds || [];
    if (!brandIds || brandIds.length === 0) return null;
    const brandsToShow = brands.filter(brand => brandIds.includes(brand.id));
    if (brandsToShow.length === 0) return null;

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <SectionTitle title={section.title} link="/manufacturers" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {brandsToShow.map((brand, index) => (
                        <div key={brand.id} className="flex justify-center items-center p-4 bg-slate-50 rounded-xl" data-aos="fade-up" data-aos-delay={index * 50}>
                            <img src={brand.logo} alt={brand.name} className="h-10 object-contain" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const getColSpanClass = (span?: number) => {
    switch (span) {
        case 1: return 'lg:col-span-1';
        case 2: return 'lg:col-span-2';
        case 3: return 'lg:col-span-3';
        case 4: return 'lg:col-span-4';
        case 5: return 'lg:col-span-5';
        case 6: return 'lg:col-span-6';
        case 7: return 'lg:col-span-7';
        case 8: return 'lg:col-span-8';
        case 9: return 'lg:col-span-9';
        case 10: return 'lg:col-span-10';
        case 11: return 'lg:col-span-11';
        case 12: return 'lg:col-span-12';
        default: return 'lg:col-span-12';
    }
}

interface HomePageData {
    products: Product[];
    featuredProducts: Product[];
    trendingProducts: Product[];
    categories: Category[];
    brands: Brand[];
    loading: boolean;
}

// Add About Us Section Component
const AboutUsSection: React.FC<{ aboutUsData: AboutUsData | null; loading: boolean; isMobile: boolean }> = ({
    aboutUsData,
    loading,
    isMobile
}) => {
    if (loading) {
        return (
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-pulse text-slate-400">Loading About Us content...</div>
                    </div>
                </div>
            </section>
        );
    }

    if (!aboutUsData) {
        return null; // Don't show section if no data
    }

    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2" data-aos="fade-right">
                        <h2 className="text-3xl font-poppins font-bold text-slate-900 mb-4 relative pb-2">
                            {aboutUsData.title}
                            <span className="absolute bottom-0 left-0 w-20 h-1 bg-primary-gradient rounded-full"></span>
                        </h2>
                        {aboutUsData.subtitle && (
                            <p className="text-slate-600 mb-4 leading-relaxed font-medium">
                                {aboutUsData.subtitle}
                            </p>
                        )}
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            {aboutUsData.mission}
                        </p>
                        {aboutUsData.vision && (
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                {aboutUsData.vision}
                            </p>
                        )}
                        <Link to="/about">
                            <Button>Learn More About Us</Button>
                        </Link>
                    </div>
                    <div className="lg:w-1/2" data-aos="fade-left">
                        {aboutUsData.image ? (
                            <img
                                src={aboutUsData.image}
                                alt={aboutUsData.title}
                                className="rounded-2xl shadow-soft-lg w-full h-auto"
                            />
                        ) : (
                            <img
                                src="/images/company-profile.jpg"
                                alt="Pharmacist assisting customer"
                                className="rounded-2xl shadow-soft-lg w-full h-auto"
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

const HomePage: React.FC = () => {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const { homepageSections, country } = useApp();

    const [homeData, setHomeData] = useState<HomePageData>({
        products: [],
        featuredProducts: [],
        trendingProducts: [],
        categories: [],
        brands: [],
        loading: true
    });

    // Add state for About Us data
    const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
    const [aboutUsLoading, setAboutUsLoading] = useState(true);

    // Add state for SEO data
    const [seoData, setSeoData] = useState(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setHomeData(prev => ({ ...prev, loading: true }));

                const [products, featuredProducts, trendingProducts, categories, brands] = await Promise.all([
                    publicProductService.getProducts(country),
                    publicProductService.getFeaturedProducts(country),
                    publicProductService.getTrendingProducts(country),
                    publicCategoryService.getCategories(),
                    publicBrandService.getBrands()
                ]);

                setHomeData({
                    products,
                    featuredProducts,
                    trendingProducts,
                    categories,
                    brands,
                    loading: false
                });
            } catch (error) {
                console.error('Error fetching home page data:', error);
                setHomeData(prev => ({ ...prev, loading: false }));
            }
        };

        // Fetch About Us data
        const fetchAboutUsData = async () => {
            try {
                setAboutUsLoading(true);
                const data = await publicAboutUsService.getAboutUs();
                setAboutUsData(data);
            } catch (error) {
                console.error('Error fetching About Us data:', error);
                setAboutUsData(null);
            } finally {
                setAboutUsLoading(false);
            }
        };

        // Fetch SEO data
        const fetchSeoData = async () => {
            try {
                const data = await websiteSettingsService.getPageSeo('home');
                setSeoData(data);
            } catch (error) {
                console.error('Error fetching SEO data:', error);
            }
        };

        fetchHomeData();
        fetchAboutUsData();
        fetchSeoData();
    }, []);

    const getProductsByCategory = (slug: string, count: number = 10) => {
        return homeData.products.filter(p => p.category?.slug === slug).slice(0, count);
    };

    const renderSection = (section: HomepageSection, index: number, isNested: boolean = false) => {
        if (!section.enabled) return null;

        const bgClass = isNested ? 'bg-transparent' : (index % 2 === 0 ? 'bg-white' : 'bg-slate-50');
        const paddingClass = isNested ? '' : 'py-16';

        if (homeData.loading) {
            return (
                <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                    <div className="container mx-auto px-4">
                        <SectionTitle title={section.title} />
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-pulse text-slate-400">Loading {section.title}...</div>
                        </div>
                    </div>
                </section>
            );
        }

        const getConfig = (key: string, defaultValue: any = null) => {
            return section.config?.[key] ?? defaultValue;
        };

        switch (section.type) {
            case 'TRUST_BADGES':
                return <TrustBadgesSection key={section.id} section={section} />;
            case 'BRAND_CAROUSEL':
                return <BrandCarouselSection key={section.id} section={section} brands={homeData.brands} />;
            case 'FEATURED_PRODUCTS':
                const featuredProducts = homeData.featuredProducts.length > 0
                    ? homeData.featuredProducts.slice(0, getConfig('productCount', 8))
                    : homeData.products.filter(p => p.isFeatured).slice(0, getConfig('productCount', 8));

                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <SectionTitle title={section.title} link="/category/all" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {featuredProducts.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={6 + index * 2} />
                                ))}
                            </div>
                        </div>
                    </section>
                );
            case 'CATEGORY_GRID':
                const start = (getConfig('categoryDisplayStart', 1)) - 1;
                const count = getConfig('categoryDisplayCount', 18);
                const end = start + count;
                const categoriesToShow = homeData.categories.slice(start, end);
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <SectionTitle title={section.title} />
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-3 md:gap-4">
                                {categoriesToShow.map((category, index) => (
                                    <Link
                                        key={category.id}
                                        to={`/category/${category.slug}`}
                                        className="group flex flex-col items-center text-center p-2 md:p-3 bg-white rounded-2xl shadow-soft-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                                        data-aos="fade-up"
                                        data-aos-delay={index * 30}
                                    >
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-105"
                                            style={{ backgroundColor: `${category.color}20` }}
                                        >
                                            <div className="w-8 h-8" style={{ color: category.color }}>
                                                {category.icon}
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700 leading-tight group-hover:text-primaryEnd transition-colors">{category.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                );
            case 'CATEGORY_CAROUSEL':
                const categorySlug = getConfig('categorySlug');
                if (!categorySlug) return null;
                const products = getProductsByCategory(categorySlug, getConfig('productCount', 8));
                return <ProductCarousel key={section.id} title={section.title} products={products} categorySlug={categorySlug} bgClass={`${paddingClass} ${bgClass}`} />;

            case 'PROMO_GRID':
                const promoGridItems = getConfig('promoGridItems', []);
                if (!promoGridItems || promoGridItems.length === 0) return null;
                return (
                    <section className={`${paddingClass} ${bgClass}`} data-aos="fade-in" key={section.id}>
                        <div className="container mx-auto px-4">
                            <SectionTitle title={section.title} />
                            <PromotionalGrid items={promoGridItems} />
                        </div>
                    </section>
                );

            case 'FEATURE_CARDS':
                const featureCards = getConfig('featureCards', []);
                if (!featureCards || featureCards.length === 0) return null;
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <SectionTitle title={section.title} />
                            <FeatureCards items={featureCards} />
                        </div>
                    </section>
                );

            case 'IMAGE_GALLERY':
                const galleryImages = getConfig('galleryImages', []);
                const galleryLayout = getConfig('galleryLayout', 'grid');
                if (!galleryImages || galleryImages.length === 0) return null;
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <SectionTitle title={section.title} />
                            <ImageGallery images={galleryImages} layout={galleryLayout} />
                        </div>
                    </section>
                );

            case 'PROMO_BANNER':
                return (
                    <section className={`${paddingClass} ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50'}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <PromoBanner
                                title={getConfig('promoBannerTitle', 'Special Offer')}
                                subtitle={getConfig('promoBannerSubtitle', 'Check out our latest deals.')}
                                buttonText={getConfig('promoBannerButtonText', 'Shop Now')}
                                link={getConfig('promoBannerLink', '/offers')}
                                bgImage={getConfig('promoBannerImage', '')}
                                variant={getConfig('promoBannerButtonVariant')}
                            />
                        </div>
                    </section>
                );

            case 'PROMO_CARDS':
                const promoCards = getConfig('promoCards', []);
                if (!promoCards || promoCards.length === 0) return null;
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <PromoCards items={promoCards} />
                        </div>
                    </section>
                );

            case 'NEWSLETTER_SIGNUP':
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <NewsletterSignup />
                        </div>
                    </section>
                );

            case 'FAQ':
                const faqItems = getConfig('faqItems', []);
                if (!faqItems || faqItems.length === 0) return null;
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <SectionTitle title={section.title} />
                            <FaqSection items={faqItems} />
                        </div>
                    </section>
                );

            case 'VIDEO':
                const videoUrl = getConfig('videoUrl');
                if (!videoUrl) return null;
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <SectionTitle title={section.title} />
                            <VideoSection videoUrl={videoUrl} />
                        </div>
                    </section>
                );

            case 'CALL_TO_ACTION':
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <CallToActionSection
                                title={section.title}
                                subtitle={getConfig('ctaSubtitle', '')}
                                buttonText={getConfig('ctaButtonText', 'Learn More')}
                                link={getConfig('ctaLink', '#')}
                                buttonVariant={getConfig('ctaButtonVariant')}
                            />
                        </div>
                    </section>
                );

            case 'GRID':
                const gridItems = getConfig('items', []);
                const columnTemplate = getConfig('columnTemplate', [12]);
                if (!gridItems || gridItems.length === 0) return null;
                const numColumns = columnTemplate.length > 0 ? columnTemplate.length : 1;
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {gridItems.map((childSection, childIndex) => {
                                    const span = columnTemplate[childIndex % numColumns] || 12;
                                    return (
                                        <div key={childSection.id} className={`min-w-0 ${getColSpanClass(span)}`}>
                                            {renderSection(childSection, childIndex, true)}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </section>
                );

            case 'KEY_METRICS':
                const keyMetrics = getConfig('keyMetrics', []);
                if (!keyMetrics || keyMetrics.length === 0) return null;
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className="container mx-auto px-4">
                            <SectionTitle title={section.title} />
                            <KeyMetricsSection items={keyMetrics} />
                        </div>
                    </section>
                );

            case 'TESTIMONIALS':
                const testimonialItems = getConfig('testimonialItems', []);
                if (!testimonialItems || testimonialItems.length === 0) return null;
                if (isMobile && !isNested) return null;
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className={isNested ? '' : 'container mx-auto px-4'}>
                            <SectionTitle title={section.title} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {testimonialItems.map((testimonial, index) => (
                                    <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>
                );
            case 'BLOG':
                return (
                    <section className={`${paddingClass} ${bgClass}`} key={section.id}>
                        <div className={isNested ? '' : 'container mx-auto px-4'}>
                            <SectionTitle title={section.title} link="/blog" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {MOCK_BLOG_POSTS.slice(0, getConfig('postCount', 3)).map((article, index) => (
                                    <BlogCard key={article.id} article={article} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>
                );
            default:
                return null;
        }
    }

    return (
        <>
            <Helmet>
                <title>{seoData?.metaTitle || 'Evergreen Medicine - Your Health, Our Priority'}</title>
                <meta name="description" content={seoData?.metaDescription || 'Get authentic medicines and health products delivered to your doorstep, quickly and safely.'} />
                {seoData?.canonicalUrl && <link rel="canonical" href={seoData.canonicalUrl} />}
                {seoData?.ogTitle && <meta property="og:title" content={seoData.ogTitle} />}
                {seoData?.ogDescription && <meta property="og:description" content={seoData.ogDescription} />}
                {seoData?.ogImage && <meta property="og:image" content={seoData.ogImage} />}
                {seoData?.twitterTitle && <meta name="twitter:title" content={seoData.twitterTitle} />}
                {seoData?.twitterDescription && <meta name="twitter:description" content={seoData.twitterDescription} />}
                {seoData?.twitterImage && <meta name="twitter:image" content={seoData.twitterImage} />}
                {seoData?.structuredData && (
                    <script type="application/ld+json">
                        {JSON.stringify(seoData.structuredData)}
                    </script>
                )}
            </Helmet>
            <div className="bg-slate-50">
                {/* Company Name on Mobile */}
                {/* {isMobile && (
                 <div className="bg-white py-4">
                    <div className="container mx-auto px-4">
                        <Link to="/" className="font-poppins font-bold text-primaryStart flex flex-col leading-tight">
                            <span className="text-3xl">Evergreen</span>
                            <span className="text-xl">Medicine</span>
                        </Link>
                    </div>
                </div>
            )} */}

                {/* Hero Section */}
                {/* Mobile Hero View */}
                <div className="md:hidden p-4" data-aos="fade-in">
                    <div className="relative rounded-2xl shadow-lg overflow-hidden text-white">
                        <img src="hero-bg.jpeg" alt="Healthcare professional with equipment" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/80 to-slate-800/30"></div>
                        <div className="relative p-8">
                            <h1 className="text-4xl font-serif font-bold mb-4 leading-tight">Your Health, Our Priority</h1>
                            <p className="text-lg text-slate-200 mb-8">
                                Get authentic medicines and health products delivered to your doorstep, quickly and safely.
                            </p>
                            <Link to="/category/all">
                                <Button size="lg">Shop All Products</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Medicine Request Form for Mobile */}
                    <div className="mt-6" data-aos="fade-up">
                        <MedicineRequestForm />
                    </div>
                </div>

                {/* Desktop Hero View */}
                <section className="hidden md:block relative text-white" data-aos="fade-in">
                    <img src="hero-bg.jpeg" alt="Healthcare professional with equipment" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-slate-900/20"></div>
                    <div className="relative container mx-auto px-4">
                        <div className="py-24 md:py-40 flex justify-between items-center">
                            <div className="max-w-xl" data-aos="fade-right">
                                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">Your Health, Our Priority</h1>
                                <p className="text-lg text-slate-200 max-w-2xl mx-auto mb-8">
                                    Get authentic medicines and health products delivered to your doorstep, quickly and safely.
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                                    <Link to="/category/all">
                                        <Button size="lg">Shop All Products</Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="w-full max-w-md" data-aos="fade-left">
                                <MedicineRequestForm />
                            </div>
                        </div>
                    </div>
                </section>

                {homepageSections.map((section, index) => renderSection(section, index))}

                {/* Replace static Company Profile with dynamic About Us Section */}
                {!isMobile && (
                    <AboutUsSection
                        aboutUsData={aboutUsData}
                        loading={aboutUsLoading}
                        isMobile={isMobile}
                    />
                )}
            </div>

            {/* WhatsApp Button */}
            <a
                href="https://wa.me/+16622191702?text=Hello%20Evergreen%20Medicine"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-24 right-6 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transform hover:scale-110 transition-all duration-300 z-50"
                aria-label="Contact us on WhatsApp"
            >
                {React.cloneElement(ICONS.whatsapp, { className: 'w-8 h-8' })}
            </a>
        </>
    );
};

export default HomePage;