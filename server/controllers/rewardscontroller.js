const User = require('../models/user');
const Book = require('../models/book');
const Reward = require('../models/reward');

const checkAndAwardRewards = async (userId) => {
    try {
        const user = await User.findById(userId).populate('rewards');
        const wordsRead = user.wordsRead;

        const rewards = await Reward.find();

        for (let reward of rewards) {
            // Vérifiez si l'utilisateur a déjà reçu cette récompense
            const alreadyRewarded = user.rewards.some(userReward => userReward.rewardId === reward.rewardId);

            if (wordsRead >= reward.threshold && !alreadyRewarded) {
                const newReward = await Reward.findOne({ rewardId: reward.rewardId });

                if (newReward) {
                    user.rewards.push(newReward._id);
                    await user.save();
                } else {
                    console.error(`Récompense introuvable pour ${reward.name}`);
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des récompenses :', error);
    }
};

const verifyRewards = async (req, res) => {
    try {
        // Récupérer l'utilisateur
        const userId = req.user.id
        const user = await User.findById(userId).populate('rewards');

        // Récupérer toutes les récompenses
        const rewards = await Reward.find();

        // Filtrer les récompenses que l'utilisateur n'a pas encore
        const userRewardIds = user.rewards.map(reward => reward._id.toString());
        const eligibleRewards = rewards.filter(reward => {
            return user.wordsRead >= reward.threshold && !userRewardIds.includes(reward._id.toString());
        });

        // Ajouter les récompenses éligibles à l'utilisateur
        if (eligibleRewards.length > 0) {
            eligibleRewards.forEach(reward => {
                user.rewards.push(reward._id);
                reward.users.push(userId);
            });

            // Sauvegarder les mises à jour
            await user.save();
            await Promise.all(eligibleRewards.map(reward => reward.save()));
            res.status(200).json(eligibleRewards)
        }
        else{
            res.status(200).json('Aucune récompense trouvée')
        }

    } catch (error) {
        console.error(error);
    }
}

const getUserRewards = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('rewards');

        res.status(200).json(user.rewards);
    } catch (error) {
        console.error('Erreur lors de la récupération des récompenses :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des récompenses' });
    }
};

module.exports = { checkAndAwardRewards, getUserRewards, verifyRewards }