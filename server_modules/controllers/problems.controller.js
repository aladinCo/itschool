const CONTROLLERS = "Problems"

import config  from "config"
const cfg = config[CONTROLLERS]

import logger  from "../utils/logger.js"



import { Problems, User, ProblemSubmission} from "../models/index.js";

/*****************************************************************************
 * Отримує список проблем зі статусами для конкретного користувача.
 * 
 * @param {string} userId - ID користувача, для якого потрібно отримати задачі.
 * @param {number} skip - Кількість елементів, які потрібно пропустити (для пагінації).
 * @param {number} limit - Максимальна кількість елементів, які потрібно повернути.
 * @returns {Object} - Об'єкт, що містить список задач (`problems`) та загальну кількість (`totalItems`).
 * 
 * Приклад використання:
 * const { problems, totalItems } = await getProblemsWithStatus(userId, 0, 10);
 ********************************************************************************/

const getProblemsWithStatus = async (userId, skip, limit) => {
    try {
        const result = await Problems.aggregate([
            {
                $lookup: {
                    from: 'problemsubmissions', // Джойн з колекцією submissions
                    let: { problemId: '$_id' }, // Змінна для використання в pipeline
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { 
                                    $and: [
                                        { $eq: ['$idProblem', '$$problemId'] }, // Фільтр по problemId
                                        { $eq: ['$idUser', userId] } // Фільтр по userId
                                    ]
                                } 
                            }
                        },
                        { $sort: { status: -1, createdAt: -1 } }, // Сортування за статусом та датою
                        { $limit: 1 }, // Обмеження до одного результату
                        { $project: { status: 1, _id: 0 } } // Вибираємо лише поле status
                    ],
                    as: 'submissions' // Назва поля, куди будуть додані результати
                }
            },
            {
                $lookup: {
                    from: 'themes', // Джойн з колекцією themes
                    localField: 'themes', // Поле в колекції Problems
                    foreignField: '_id', // Поле в колекції Themes
                    as: 'themesData' // Назва поля, куди будуть додані результати
                }
            },
            {
                $addFields: { 
                    // Додаємо поле status, беручи перший елемент з масиву submissions
                    status: { $ifNull: [{ $arrayElemAt: ['$submissions.status', 0] }, null] },
                    // Додаємо поле themes, беручи перший елемент з масиву themesData
                    themes: { $ifNull: [{ $arrayElemAt: ['$themesData', 0] }, {}] }
                }
            },
            {
                $project: { 
                    // Виключаємо поле submissions
                    submissions: 0, 
                    // Виключаємо поле themesData
                    themesData: 0 
                }
            },
            {
                $facet: {
                    // Отримуємо загальну кількість документів
                    totalCount: [
                        { $count: 'count' }
                    ],
                    // Отримуємо пагінований список проблем
                    problems: [
                        // Виключаємо непотрібні поля
                        { $project: { submissions: 0, themesData: 0 } }, 
                        // Пропускаємо певну кількість документів
                        { $skip: skip }, 
                        // Обмежуємо кількість документів
                        { $limit: limit } 
                    ]
                }
            },
            {
                $addFields: {
                    // Додаємо поле totalCount, беручи перший елемент з масиву totalCount
                    totalCount: { $arrayElemAt: ['$totalCount.count', 0] }
                }
            }
        ]);

        // Отримуємо загальну кількість задач
        const totalItems = result[0]?.totalCount || 0;

        // Отримуємо список задач
        const problems = result[0]?.problems || [];

        // Повертаємо результати
        return { problems, totalItems };

    } catch (error) {
        return { problems: [], totalItems: 0 };
    }
};

/********************************************************************************
 * Отримує список задач зі статусами для конкретного користувача з пагінацією.
 * 
 * @param {Object} req - Об'єкт запиту (request).
 * @param {Object} res - Об'єкт відповіді (response).
 * 
 * @example
 * // Запит:
 * GET /problems?page=2
 * 
 * // Відповідь:
 * {
 *   status: true,
 *   message: "Ok",
 *   result: {
 *     totalResults: {
 *       limit: 20,
 *       totalItems: 100
 *     },
 *     problems: [
 *       {
 *         _id: "problem1",
 *         title: "Problem 1",
 *         status: "solved",
 *         themes: { _id: "theme1", name: "Theme 1" }
 *       },
 *       ..........
 *     ]
 *   }
 * }
 ********************************************************************************/

const getAll = async (req, res) => {

    const LIMIT = 20; // Кількість елементів на сторінці
    const publicId = req?.iduser?.publicId; // Отримуємо publicId з запиту
    const page = parseInt(req.query.page) || 1; // Отримуємо номер сторінки з запиту (за замовчуванням 1)

    // Перевірка наявності publicId
    if (!publicId || publicId === "") {
        logger.error(`${CONTROLLERS}: ${CONTROLLERS_ERRORS.INVALID_NUMBER}`, { regparam: req.params, publicId: req?.iduser }, res);
    }

    // Встановлюємо sessionId для логера
    logger.sessionId = publicId;

    try {
        // Знаходимо користувача за publicId
        const user = await User.findOne({ publicId: publicId }).select("_id");
        
        // Якщо користувач не знайдений
        if (!user) {
            logger.error(`${CONTROLLERS}: User not found`, { regparam: req.params, publicId }, res);
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Отримуємо задачі зі статусами
        const { problems, totalItems } = await getProblemsWithStatus(user._id, (page - 1) * LIMIT, LIMIT);

        // Відправляємо успішну відповідь
        res.status(200).json({
            status: true,
            message: "Ok",
            result: {
                totalResults: {
                    limit: LIMIT,
                    totalItems: totalItems
                },
                problems: problems
            }
        });
    } catch (error) {
        // Логуємо помилку та відправляємо токен з помилки
        logger.error(`${CONTROLLERS}: ${error.message}`, { regparam: req.params, publicId }, res);
    }
};

// /api/problem/:id
const getOne = async (req, res) => {
    try{
        const numProblem = req.params.id;
        if (!numProblem ?? numProblem === "") throw new Error(CONTROLLERS_ERRORS.INVALID_NUMBER);

        const publicId = req?.iduser?.publicId;
        if (!publicId ?? publicId === "") throw new Error(CONTROLLERS_ERRORS.INVALID_NUMBER);

        logger.sessionId = publicId;

    
        const user = await User.findOne({ publicId: publicId }).select("_id")    
        
        const problem = await Problems.findOne({ num: numProblem })
                .populate({path: 'themes',select: ['name']}).lean();
                
        if (!problem) throw new Error(CONTROLLERS_ERRORS.PROBLEM_NOT_EXIST);
        
        //const problemSubmission = await ProblemSubmission.findOne({ idProblem: problem._id, idUser:user._id })
        const problemSubmission = await ProblemSubmission.aggregate([
            { $match: { idProblem: problem._id, idUser: user._id } },
            { $sort: { status: -1, createdAt: -1 } }, // Спочатку status: true, потім по createdAt
            { $limit: 1 } // Беремо лише 1 запис
          ]);

        const result = {
            ...problem, 
            scoredAll: problemSubmission?.[0]?.scoredAll || 0, // Якщо немає – значення за замовчуванням
            balAll: problemSubmission?.[0]?.balAll || 0,
            status: problemSubmission?.[0]?.status ?? false // Якщо status може бути false/null
        }


        return res.status(200).json({ status: true, message: `Ok`, result: result })
    } catch (error) { 

        logger.error(`${CONTROLLERS}:${error.message}`, {regparam: req.params, publicId:req?.iduser}, res)
        //res.status(500).json({ status: false, message: logger.sessionId , result:error.message})
    }
}

export default { getAll, getOne };
