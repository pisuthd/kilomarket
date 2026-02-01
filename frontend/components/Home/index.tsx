import CriticalQuestion from "./CriticalQuestion"
import Hero from "./Hero"
import HowItWorks from "./HowItWorks"
import UseCases from "./UseCases"
import CTA from "./CTA"

const HomeContainer = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white"> 
             <Hero /> 
             <CriticalQuestion/>
             <HowItWorks />
             <UseCases />
             <CTA />
        </div>
    )
}

export default HomeContainer