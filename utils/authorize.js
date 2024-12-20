import { expressjwt as jwt } from 'express-jwt';
import { secret } from './../config/config.js'; // Import du secret depuis le fichier config

export default function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles]; // Si un seul rôle est passé, on le convertit en tableau
    }

    // Log pour vérifier que le secret est bien importé
    // console.log('JWT Secret:', secret);

    return [
        // Log pour vérifier si l'en-tête Authorization est bien envoyé
        (req, res, next) => {
            console.log('Authorization Header:', req.headers.authorization); // Vérifie si le token est bien envoyé
            next();
        },

        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ['HS256'], requestProperty: 'user' }),

        // Gestion des erreurs JWT
        (err, req, res, next) => {
            if (err.name === 'UnauthorizedError') {
                console.log('JWT validation failed:', err); // Log de l'erreur JWT
                return res.status(401).json({ message: 'Invalid token: ' + err.message });
            }
            next();
        },

        // Vérification du contenu de req.user
        (req, res, next) => {
            console.log('JWT Secret2:', secret);
            console.log('JWT middleware passed.');
            console.log('User info from token:', req.user); // Log des informations utilisateur extraites du token

            // Vérifier si req.user est défini
            if (!req.user) {
                console.log('Authorization failed: No user information found in the token.');
                return res.status(401).json({ message: 'Unauthorized: No user information found in token.' });
            }

            // Vérifier si req.user.role est défini
            if (!req.user.role) {
                console.log('Authorization failed: No role defined in token.');
                return res.status(401).json({ message: 'Unauthorized: No role defined in token.' });
            }

            // Log pour vérifier les rôles autorisés et celui de l'utilisateur
            console.log('Required roles:', roles);
            console.log('User role:', req.user.role);

            // Vérifier si le rôle de l'utilisateur est autorisé
            if (roles.length && !roles.includes(req.user.role)) {
                console.log('Forbidden: Insufficient role privileges.'); // Log en cas de rôle insuffisant
                return res.status(403).json({ message: 'Forbidden: Insufficient role privileges.' });
            }

            // Authentification et autorisation réussies
            console.log('Authorization successful, proceeding to the next middleware.');
            next();
        }
    ];
}
