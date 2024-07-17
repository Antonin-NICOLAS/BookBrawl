const User = require('../models/user');
const Reward = require('../models/reward');

const checkAndAwardRewards = async (userId) => {
    try {
        const user = await User.findById(userId).populate('rewards');
        const wordsRead = user.wordsRead;
        const booksReadCount = user.booksRead.length;

        const rewards = await Reward.find();

        for (let reward of rewards) {
            // Vérifiez si l'utilisateur a déjà reçu cette récompense
            const alreadyRewarded = user.rewards.some(userReward => userReward.equals(reward._id));

            if (!alreadyRewarded) {
                let eligible = false;

                if (reward.criteria === 'word' && wordsRead >= reward.threshold) {
                    eligible = true;
                } else if (reward.criteria === 'book' && booksReadCount >= reward.threshold) {
                    eligible = true;
                }

                if (eligible) {
                    user.rewards.push(reward._id);
                    reward.users.push(userId);
                    await user.save();
                    await reward.save();
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des récompenses :', error);
        //pas de res --> fonction intégrée
    }
};

const checkAndRevokeRewards = async (userId) => {
    try {
        const user = await User.findById(userId).populate('rewards');
        const wordsRead = user.wordsRead;
        const booksReadCount = user.booksRead.length;

        const rewards = await Reward.find();

        for (let reward of rewards) {
            // Vérifiez si l'utilisateur a reçu cette récompense
            const alreadyRewarded = user.rewards.some(userReward => userReward.equals(reward._id));

            if (alreadyRewarded) {
                let shouldRevoke = false;

                if (reward.criteria === 'word' && wordsRead < reward.threshold) {
                    shouldRevoke = true;
                } else if (reward.criteria === 'book' && booksReadCount < reward.threshold) {
                    shouldRevoke = true;
                }

                if (shouldRevoke) {
                    // Supprimer la récompense de l'utilisateur
                    user.rewards = user.rewards.filter(userReward => !userReward.equals(reward._id));
                    await user.save();

                    // Supprimer l'utilisateur de la liste des utilisateurs récompensés
                    reward.users = reward.users.filter(user => !user.equals(userId));
                    await reward.save();
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la révocation des récompenses :', error);
        //pas de res --> fonction intégrée
    }
};

const verifyRewards = async (req, res) => {
    try {
        // Récupérer l'utilisateur
        const userId = req.user.id;
        const user = await User.findById(userId).populate('rewards');

        // Récupérer toutes les récompenses
        const rewards = await Reward.find();

        // Filtrer les récompenses que l'utilisateur n'a pas encore
        const userRewardIds = user.rewards.map(reward => reward._id.toString());
        const eligibleRewards = rewards.filter(reward => {
            let eligible = false;

            if (reward.criteria === 'word' && user.wordsRead >= reward.threshold && !userRewardIds.includes(reward._id.toString())) {
                eligible = true;
            } else if (reward.criteria === 'book' && user.booksRead.length >= reward.threshold && !userRewardIds.includes(reward._id.toString())) {
                eligible = true;
            }

            return eligible;
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
            res.status(200).json(eligibleRewards);
        } else {
            res.status(200).json({ message: "Vous n'avez gagné aucun nouveau badge de récompense" });
        }

    } catch (error) {
        console.error('Erreur lors de la vérification des récompenses', error);
        res.status(500).json({ error: 'Erreur lors de la vérification des récompenses.' });
    }
};

const getUserRewards = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('rewards');

        res.status(200).json(user.rewards);
    } catch (error) {
        console.error('Erreur lors de la récupération des récompenses :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des récompenses.' });
    }
};

module.exports = { checkAndAwardRewards, checkAndRevokeRewards, getUserRewards, verifyRewards }