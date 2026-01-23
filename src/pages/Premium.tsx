import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, Heart, Zap, Shield, Star, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { RalphMascot } from '../components/ralph/RalphMascot'

const features = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Vies illimitées',
    description: 'Plus jamais à court de vies'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'XP Bonus',
    description: '+50% d\'XP sur chaque leçon'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Sans publicité',
    description: 'Expérience 100% fluide'
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Accès anticipé',
    description: 'Nouvelles catégories en avant-première'
  }
]

export function PremiumPage() {
  const navigate = useNavigate()

  const handleSubscribe = () => {
    // TODO: Integrate Stripe
    console.log('Subscribe to premium')
  }

  return (
    <div className="min-h-screen bg-genius-bg p-4">
      {/* Close button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
      >
        <X className="w-6 h-6 text-gray-400" />
      </button>

      <div className="max-w-lg mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <RalphMascot mood="celebrating" size="lg" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full mt-4"
          >
            <Star className="w-5 h-5 fill-white" />
            <span className="font-bold">GENIUS PLUS</span>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mt-4">
            Deviens un vrai Génie !
          </h1>
          <p className="text-gray-400 mt-2">
            Débloquez toutes les fonctionnalités premium
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card variant="glass" padding="md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-400">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                  <Check className="w-5 h-5 text-green-400" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {/* Monthly */}
          <Card
            variant="default"
            padding="lg"
            className="border-2 border-primary-500 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAIRE
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Mensuel</p>
                <p className="text-sm text-gray-400">Annuler à tout moment</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">9,99€</p>
                <p className="text-xs text-gray-500">/mois</p>
              </div>
            </div>
          </Card>

          {/* Annual */}
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Annuel</p>
                <p className="text-sm text-green-400">Économise 40%</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">5,99€</p>
                <p className="text-xs text-gray-500">/mois (71,88€/an)</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Subscribe button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <Button
            onClick={handleSubscribe}
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Devenir Genius Plus
          </Button>

          <p className="text-center text-xs text-gray-500 mt-4">
            7 jours d'essai gratuit • Annulation facile
          </p>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Card variant="glass" padding="md">
            <p className="text-gray-300 italic">
              "Genius Plus m'a permis de doubler mon XP en une semaine !"
            </p>
            <p className="text-sm text-gray-500 mt-2">— Marie, utilisatrice depuis 6 mois</p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
